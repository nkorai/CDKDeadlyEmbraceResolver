'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CfnTable = exports.Table = exports.AttributeType = void 0;
const index_1 = require('../../constructs/index');
const index_2 = require('../index');
/**
 * Enumeration of DynamoDB attribute types.  Only STRING is defined
 * because our tests use it for the table’s partition key.  Additional
 * values could be added here if needed.
 */
var AttributeType;
(function (AttributeType) {
  AttributeType['STRING'] = 'STRING';
  AttributeType['NUMBER'] = 'NUMBER';
  AttributeType['BINARY'] = 'BINARY';
})(AttributeType || (exports.AttributeType = AttributeType = {}));
/**
 * A very small DynamoDB Table construct.  It sets up two token
 * properties (`tableArn` and `tableName`) that resolve to
 * CloudFormation intrinsic functions when exported.  The underlying
 * resource is modelled as a `CfnResource` with a logical ID derived
 * from the id passed to the constructor.
 */
class Table extends index_1.Construct {
  constructor(scope, id, _props) {
    super(scope, id);
    const stack = index_2.Stack.of(this);
    // Use a deterministic logical ID for the underlying resource.  In
    // reality this id contains a hash suffix; the exact value is not
    // important for the resolver.  We append 'Resource' here for clarity.
    const logicalId = `${id}Resource`;
    const cfn = new index_2.CfnResource(this, logicalId);
    // Expose the default child so the resolver can access its logical ID.
    this.node.defaultChild = cfn;
    // Build intrinsic tokens for the ARN and Name.  These mimic the
    // objects returned by the real CDK when you access `table.tableArn`
    // and `table.tableName`.  During synthesis these objects become
    // Fn::GetAtt and Ref expressions respectively.
    this.tableArn = { 'Fn::GetAtt': [logicalId, 'Arn'] };
    this.tableName = { Ref: logicalId };
  }
}
exports.Table = Table;
/**
 * Alias for the low level CloudFormation table resource.  In the real
 * CDK this class exposes many properties for configuring the table.
 * Our tests only require access to the `logicalId` property, which is
 * provided by the base `CfnResource` class.  We export the alias
 * nonetheless to mirror the real module structure.
 */
class CfnTable extends index_2.CfnResource {}
exports.CfnTable = CfnTable;
