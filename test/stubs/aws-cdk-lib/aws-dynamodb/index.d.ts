import { Construct } from '../../../constructs/index';
import { CfnResource } from '../index';
/**
 * Enumeration of DynamoDB attribute types.  Only STRING is defined
 * because our tests use it for the table’s partition key.  Additional
 * values could be added here if needed.
 */
export declare enum AttributeType {
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
export declare class Table extends Construct {
  readonly tableArn: any;
  readonly tableName: any;
  readonly node: {
    path: string;
    defaultChild?: CfnResource;
  };
  constructor(
    scope: Construct,
    id: string,
    _props: {
      partitionKey: {
        name: string;
        type: AttributeType;
      };
    },
  );
}
/**
 * Alias for the low level CloudFormation table resource.  In the real
 * CDK this class exposes many properties for configuring the table.
 * Our tests only require access to the `logicalId` property, which is
 * provided by the base `CfnResource` class.  We export the alias
 * nonetheless to mirror the real module structure.
 */
export declare class CfnTable extends CfnResource {}
