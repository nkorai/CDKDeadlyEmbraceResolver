// src/index.ts
import { Stack, Token } from 'aws-cdk-lib';
import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

/**
 * Options for the unsafe resolver. Users can explicitly specify which
 * properties of the resource should be exported, along with the
 * corresponding export names. If `properties` is undefined the
 * resolver will attempt to infer common ARN/Name properties from the
 * supplied construct (for example `tableArn`/`tableName` on a
 * DynamoDB table).
 */
export interface UnsafeResolveOptions {
  /**
   * An array of property names on the resource that should be exported.
   * By default the resolver will look for properties ending in
   * `Arn` or `Name`. If you provide this option the resolver will
   * only use these properties.
   */
  properties?: string[];

  /**
   * A map of custom export names keyed by property name. When
   * specified, the resolver will use the provided value instead of
   * generating an export name automatically.
   */
  exportNames?: Record<string, string>;
}

/**
 * Attempt to preserve CloudFormation exports for all cross-stack
 * references on the given resource. This helper is deliberately
 * marked as "unsafe" because it depends on heuristics to determine
 * which attributes of the resource should be exported and how to
 * construct the corresponding export names. It is intended to
 * unblock the "deadly embrace" scenario. You should remove the calls to
 * this helper once the consuming stack has been updated and it is
 * safe to delete the exports.
 *
 * IMPORTANT: We MUST NOT incorporate any unresolved Tokens (e.g. a Cfn logicalId)
 * into the export name, otherwise CDK will throw UnscopedValidationError.
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

  // Derive a deterministic, *pure string* identifier basis from construct path/ID.
  // DO NOT use defaultChild.logicalId here (it can be a lazy token pre-synth).
  const defaultChild = (resource as any).node?.defaultChild as CfnResource | undefined;
  const idBasis =
    defaultChild?.node?.path ??
    (resource as any).node?.path ??
    (resource as any).node?.id ??
    'Resource';

  const logicalIdLike = sanitizeLogicalId(idBasis);

  // Build the list of property names to export. Use caller-provided
  // names if available, otherwise infer from the object.
  const propertyNames = options.properties ?? inferExportableProperties(resource);

  for (const propName of propertyNames) {
    // Skip if the property doesn't exist on the construct.
    if (!hasOwn(resource, propName)) continue;

    // The value is expected to be a token (e.g. Ref or GetAtt) — that's fine.
    // We only need to ensure the *export name* itself is a plain string.
    const value: any = (resource as any)[propName];
    if (value === undefined || value === null) continue;

    // Compute an export name. Allow callers to override per-property names.
    const explicitName = options.exportNames?.[propName];
    const exportName = explicitName ?? defaultExportName(stack.stackName, logicalIdLike, propName);

    // Defensive: ensure we never pass a Token as the name.
    if (Token.isUnresolved(exportName as any)) {
      throw new Error(
        `Export name for property "${propName}" resolved to a Token; expected string`,
      );
    }

    // Register the export on the stack. Provide a stable name to keep the same export identifier.
    stack.exportValue(value as any, { name: exportName });
  }
}

/**
 * Infer common exportable properties from a construct. A property is
 * considered exportable if its name ends with `Arn` or `Name` and
 * the value is not a function. This covers most high level CDK
 * constructs such as DynamoDB tables (`tableArn`/`tableName`), S3
 * buckets (`bucketArn`/`bucketName`), queues (`queueArn`/`queueName`)
 * and SNS topics (`topicArn`/`topicName`).
 */
function inferExportableProperties(resource: IConstruct): string[] {
  const props: string[] = [];
  const obj = resource as any;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'function') continue;
    if (key.endsWith('Arn') || key.endsWith('Name')) props.push(key);
  }
  return props;
}

/**
 * Compute a deterministic export name for a property on a resource.
 * Mirrors CDK's general export naming pattern, without reproducing internal hashes.
 * Examples:
 *  - Arn properties:   <StackName>:ExportsOutputFnGetAtt<LogicalIdLike>Arn
 *  - Name properties:  <StackName>:ExportsOutputRef<LogicalIdLike>
 *  - Fallback:         <StackName>:ExportsOutput<LogicalIdLike><PropName>
 */
function defaultExportName(stackName: string, logicalIdLike: string, propName: string): string {
  // Clean the stackName as well to avoid illegal characters creeping into names.
  const cleanStack = sanitizeExportFragment(stackName);

  if (propName.endsWith('Arn')) {
    return `${cleanStack}:ExportsOutputFnGetAtt${logicalIdLike}Arn`;
  }
  if (propName.endsWith('Name')) {
    return `${cleanStack}:ExportsOutputRef${logicalIdLike}`;
  }
  return `${cleanStack}:ExportsOutput${logicalIdLike}${propName}`;
}

/**
 * Utility for determining if a given object has an own (non-inherited) property.
 */
function hasOwn(obj: any, propName: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, propName);
}

/**
 * When deriving a "logical ID like" identifier from a construct path/ID,
 * keep only alphanumerics and capitalise path segments to get a stable,
 * CloudFormation-friendly fragment.
 */
function sanitizeLogicalId(pathOrId: string): string {
  const cleaned = pathOrId.replace(/^\//, '');
  const parts = cleaned.split(/[/:]/).filter(Boolean);
  const capitalised = parts.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  return capitalised.join('').replace(/[^A-Za-z0-9]/g, '');
}

/**
 * Sanitize arbitrary export-name fragments (e.g., stackName) to avoid odd chars.
 */
function sanitizeExportFragment(fragment: string): string {
  // Allow common characters in stack names, but strip anything risky for exports:
  // Keep alphanumerics, dash, underscore, colon. (Colon used by CDK in export names.)
  return String(fragment).replace(/[^A-Za-z0-9:_-]/g, '');
}
