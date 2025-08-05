import { Construct } from '../../constructs/index';
import { Stack, CfnResource } from '../index';

/**
 * Enumeration of DynamoDB attribute types.  Only STRING is defined
 * because our tests use it for the table’s partition key.  Additional
 * values could be added here if needed.
 */
export enum AttributeType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BINARY = 'BINARY',
}

/**
 * A very small DynamoDB Table construct.  It sets up two token
 * properties (`tableArn` and `tableName`) that resolve to
 * CloudFormation intrinsic functions when exported.  The underlying
 * resource is modelled as a `CfnResource` with a logical ID derived
 * from the id passed to the constructor.
 */
export class Table extends Construct {
  public readonly tableArn: any;
  public readonly tableName: any;
  constructor(
    scope: Construct,
    id: string,
    _props: { partitionKey: { name: string; type: AttributeType } },
  ) {
    super(scope, id);
    const _stack = Stack.of(this);
    // Use a deterministic logical ID for the underlying resource.  In
    // reality this id contains a hash suffix; the exact value is not
    // important for the resolver.  We append 'Resource' here for clarity.
    const logicalId = `${id}Resource`;
    const cfn = new CfnResource(this, logicalId);
    // Expose the default child so the resolver can access its logical ID.
    (this as any).node.defaultChild = cfn;
    // Build intrinsic tokens for the ARN and Name.  These mimic the
    // objects returned by the real CDK when you access `table.tableArn`
    // and `table.tableName`.  During synthesis these objects become
    // Fn::GetAtt and Ref expressions respectively.
    this.tableArn = { 'Fn::GetAtt': [logicalId, 'Arn'] };
    this.tableName = { Ref: logicalId };
  }
}

/**
 * Alias for the low level CloudFormation table resource.  In the real
 * CDK this class exposes many properties for configuring the table.
 * Our tests only require access to the `logicalId` property, which is
 * provided by the base `CfnResource` class.  We export the alias
 * nonetheless to mirror the real module structure.
 */
export class CfnTable extends CfnResource {}
