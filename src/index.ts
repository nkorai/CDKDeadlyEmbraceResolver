import { Stack } from 'aws-cdk-lib';
import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

/**
 * Options for the unsafe resolver.  Users can explicitly specify which
 * properties of the resource should be exported, along with the
 * corresponding export names.  If `properties` is undefined the
 * resolver will attempt to infer common ARN/Name properties from the
 * supplied construct (for example `tableArn`/`tableName` on a
 * DynamoDB table).
 */
export interface UnsafeResolveOptions {
  /**
   * An array of property names on the resource that should be exported.
   * By default the resolver will look for properties ending in
   * `Arn` or `Name`.  If you provide this option the resolver will
   * only use these properties.
   */
  properties?: string[];
  /**
   * A map of custom export names keyed by property name.  When
   * specified, the resolver will use the provided value instead of
   * generating an export name automatically.
   */
  exportNames?: Record<string, string>;
}

/**
 * Attempt to preserve CloudFormation exports for all cross‑stack
 * references on the given resource.  This helper is deliberately
 * marked as "unsafe" because it depends on heuristics to determine
 * which attributes of the resource should be exported and how to
 * construct the corresponding export names.  It is intended to
 * unblock the "deadly embrace" scenario described in the CDK tips
 * article【562811083646194†L124-L138】.  You should remove the calls to
 * this helper once the consuming stack has been updated and it is
 * safe to delete the exports.
 *
 * @param resource The construct whose exports should be preserved.
 * @param options  Optional configuration for customizing which
 *                 properties are exported and how the export names
 *                 are generated.
 */
export function unsafeResolveDeadlyEmbrace(
  resource: any,
  options: UnsafeResolveOptions = {},
): void {
  const stack = Stack.of(resource);

  // Determine the logical ID of the underlying CloudFormation resource.
  // Many high level CDK constructs expose their underlying resource
  // through the `defaultChild` property.  If it is missing we
  // deliberately fall back to the construct path because the
  // resolver only uses the logical ID to construct a deterministic
  // export name.  The actual export name will not precisely match
  // the original auto generated one, but it will be stable within
  // your application.
  const defaultChild = (resource as any).node?.defaultChild as CfnResource | undefined;
  const logicalId =
    defaultChild?.logicalId ?? sanitizeLogicalId((resource as any).node?.path ?? '');

  // Build the list of property names to export.  Use caller provided
  // names if available, otherwise infer from the object.
  const propertyNames = options.properties ?? inferExportableProperties(resource);
  for (const propName of propertyNames) {
    // Skip if the property doesn't exist on the construct.
    if (!hasProperty(resource, propName)) {
      continue;
    }
    // Retrieve the token value.  It's important that we don't resolve
    // tokens here – CDK will handle that during synthesis.
    const value: any = (resource as any)[propName];
    if (value === undefined || value === null) {
      continue;
    }
    // Compute an export name.  Allow callers to override
    // per-property names via the exportNames option.  Otherwise use
    // heuristics based on CDK's default naming scheme.
    const explicitName = options.exportNames?.[propName];
    const exportName = explicitName ?? defaultExportName(stack.stackName, logicalId, propName);
    // Register the export on the stack.  Provide the name so that
    // successive deployments maintain the same export identifier.
    stack.exportValue(value as any, { name: exportName });
  }
}

/**
 * Infer common exportable properties from a construct.  A property is
 * considered exportable if its name ends with `Arn` or `Name` and
 * the value is not a function.  This covers most high level CDK
 * constructs such as DynamoDB tables (`tableArn`/`tableName`), S3
 * buckets (`bucketArn`/`bucketName`), queues (`queueArn`/`queueName`)
 * and SNS topics (`topicArn`/`topicName`).
 */
function inferExportableProperties(resource: IConstruct): string[] {
  const props: string[] = [];
  const obj = resource as any;
  // Enumerate own properties (including getters) of the object.
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'function') {
      continue;
    }
    if (key.match(/Arn$/)) {
      props.push(key);
    } else if (key.match(/Name$/)) {
      props.push(key);
    }
  }
  return props;
}

/**
 * Compute a deterministic export name for a property on a resource.
 * CDK uses an internal algorithm to generate export names like
 * `MyStack:ExportsOutputFnGetAttBucket83908E77Arn063C8555` when
 * synthesising cross‑stack references.  Reproducing that algorithm
 * exactly is not supported by the public API, so this helper
 * constructs a simplified name that follows the same general format
 * but omits the trailing hash【562811083646194†L145-L154】.  For example
 * exporting the `tableArn` property of a DynamoDB table whose
 * logical ID is `TableCD79AAA0` from a stack named `MyStack`
 * results in `MyStack:ExportsOutputFnGetAttTableCD79AAA0Arn`.
 */
function defaultExportName(stackName: string, logicalId: string, propName: string): string {
  // Determine whether the property is an ARN or a Ref.  Properties
  // ending with `Arn` map to `Fn::GetAtt` in CloudFormation; for those
  // we include the attribute suffix (Arn) in the export name.  All
  // other properties use the `Ref` form and therefore omit the
  // attribute name.
  if (propName.match(/Arn$/)) {
    return `${stackName}:ExportsOutputFnGetAtt${logicalId}Arn`;
  }
  if (propName.match(/Name$/)) {
    // For Name properties the CDK generated export typically uses
    // `Ref`.  Do not repeat the property name to avoid exceeding the
    // export name length limit.
    return `${stackName}:ExportsOutputRef${logicalId}`;
  }
  // Fallback for unusual property names.  In this case we simply
  // suffix the property name.
  return `${stackName}:ExportsOutput${logicalId}${propName}`;
}

/**
 * Utility for determining if a given object has a property.  Using
 * `in` would pick up inherited prototypes which is not intended.
 */
function hasProperty(obj: any, propName: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, propName);
}

/**
 * When a construct does not expose its underlying CloudFormation
 * resource through `defaultChild` we fall back to the construct
 * path.  CloudFormation logical IDs may only contain alphanumeric
 * characters, so we strip out separators and capitalise the
 * fragments.  This function is not part of the public API and is
 * deliberately conservative.  It will still generate a stable
 * identifier within your application, even if it does not exactly
 * match the logical ID that CDK would have chosen.
 */
function sanitizeLogicalId(path: string): string {
  // Remove the leading slash if present (root constructs start with '/')
  const cleaned = path.replace(/^\//, '');
  // Split on path separators and capitalise each segment.
  const parts = cleaned.split('/').filter(Boolean);
  const capitalised = parts.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  return capitalised.join('');
}
