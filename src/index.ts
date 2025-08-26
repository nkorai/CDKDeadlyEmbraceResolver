// src/index.ts
import { Stack, Token, CfnResource, CfnOutput } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

export interface UnsafeResolveOptions {
  properties?: string[];
  exportNames?: Record<string, string>;
}

export function unsafeResolveDeadlyEmbrace(
  resource: any,
  options: UnsafeResolveOptions = {},
): void {
  const stack = Stack.of(resource);

  // Use only plain strings for naming fragments.
  const defaultChild = (resource as any).node?.defaultChild as CfnResource | undefined;
  const idBasis =
    defaultChild?.node?.path ??
    (resource as any).node?.path ??
    (resource as any).node?.id ??
    'Resource';

  const logicalIdLike = sanitizeLogicalId(idBasis);
  const propertyNames = options.properties ?? inferExportableProperties(resource);

  // If stack.stackName is a Token (rare), fall back to a safe literal.
  const cleanStack = Token.isUnresolved((stack as any).stackName)
    ? 'Stack'
    : sanitizeExportFragment(stack.stackName);

  for (const propName of propertyNames) {
    if (!hasOwn(resource, propName)) continue;

    const value: any = (resource as any)[propName];
    if (value === undefined || value === null) continue;

    const exportName =
      options.exportNames?.[propName] ?? defaultExportName(cleanStack, logicalIdLike, propName);

    // Construct a *static* CfnOutput id to avoid CDK computing one from Tokens.
    const outputId = makeStableOutputId('Preserve', logicalIdLike, propName);

    // Final guard: exportName itself must be a plain string.
    if (Token.isUnresolved(exportName as any)) {
      throw new Error(`Export name for "${propName}" is a Token; expected string.`);
    }

    new CfnOutput(stack, outputId, {
      value, // may be a Token (Ref/GetAtt) — that's fine
      exportName, // must be a plain string
    });
  }
}

function inferExportableProperties(resource: IConstruct): string[] {
  const props: string[] = [];
  const obj = resource as any;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'function') continue;
    if (key.endsWith('Arn') || key.endsWith('Name')) props.push(key);
  }
  return props;
}

function defaultExportName(stackName: string, logicalIdLike: string, propName: string): string {
  if (propName.endsWith('Arn')) {
    return `${stackName}:ExportsOutputFnGetAtt${logicalIdLike}Arn`;
  }
  if (propName.endsWith('Name')) {
    return `${stackName}:ExportsOutputRef${logicalIdLike}`;
  }
  return `${stackName}:ExportsOutput${logicalIdLike}${propName}`;
}

// Build a safe, deterministic construct id for CfnOutput (no Tokens, CFN-legal chars).
function makeStableOutputId(prefix: string, logicalIdLike: string, propName: string): string {
  const suffix = propName.endsWith('Arn')
    ? 'Arn'
    : propName.endsWith('Name')
      ? 'Name'
      : sanitizeLogicalId(propName);
  // CFN logical ID limit is 255; keep generous headroom.
  const base = `${prefix}Export${logicalIdLike}${suffix}`;
  return base.slice(0, 200);
}

function hasOwn(obj: any, propName: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, propName);
}

function sanitizeLogicalId(pathOrId: string): string {
  const cleaned = pathOrId.replace(/^\//, '');
  const parts = cleaned.split(/[/:]/).filter(Boolean);
  const capitalised = parts.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  return capitalised.join('').replace(/[^A-Za-z0-9]/g, '');
}

function sanitizeExportFragment(fragment: string): string {
  return String(fragment).replace(/[^A-Za-z0-9:_-]/g, '');
}
