"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const assertions_1 = require("@aws-cdk/assertions");
const index_1 = require("../src/index");
describe('unsafeResolveDeadlyEmbrace', () => {
    test('exports common identifiers for a DynamoDB table', () => {
        var _a;
        const app = new aws_cdk_lib_1.App();
        const stack = new aws_cdk_lib_1.Stack(app, 'MyStack');
        const table = new aws_dynamodb_1.Table(stack, 'Table', {
            partitionKey: { name: 'id', type: aws_dynamodb_1.AttributeType.STRING },
        });
        // Act: apply the unsafe resolver to preserve exports
        (0, index_1.unsafeResolveDeadlyEmbrace)(table);
        const template = assertions_1.Template.fromStack(stack).toJSON();
        const outputs = (_a = template.Outputs) !== null && _a !== void 0 ? _a : {};
        // Expect exactly two outputs: one for tableArn and one for tableName
        expect(Object.keys(outputs).length).toBe(2);
        // Determine the logical ID of the underlying CfnTable.  The resolver uses
        // this to build the export names and values.
        const cfnTable = table.node.defaultChild;
        const logicalId = cfnTable.logicalId;
        const expectedArnValue = { 'Fn::GetAtt': [logicalId, 'Arn'] };
        const expectedNameValue = { Ref: logicalId };
        const values = Object.values(outputs);
        // There should be one output using Fn::GetAtt and one using Ref
        const hasArnOutput = values.some((o) => JSON.stringify(o.Value) === JSON.stringify(expectedArnValue));
        const hasRefOutput = values.some((o) => JSON.stringify(o.Value) === JSON.stringify(expectedNameValue));
        expect(hasArnOutput).toBe(true);
        expect(hasRefOutput).toBe(true);
        // Export names should start with the stack name and the standard prefix
        values.forEach((o) => {
            expect(typeof o.Export.Name).toBe('string');
            expect(o.Export.Name.startsWith('MyStack:ExportsOutput')).toBe(true);
        });
    });
});
