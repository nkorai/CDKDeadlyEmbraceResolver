// test/index.test.ts
import { App, Stack } from 'aws-cdk-lib';
import { Table, CfnTable, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Template } from '@aws-cdk/assertions';
import { unsafeResolveDeadlyEmbrace } from '../src/index';

describe('unsafeResolveDeadlyEmbrace', () => {
  test('exports common identifiers for a DynamoDB table (Arn + Name) with static names', () => {
    const app = new App();
    const stack = new Stack(app, 'MyStack');
    const table = new Table(stack, 'Table', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    // Act: apply the unsafe resolver to preserve exports
    unsafeResolveDeadlyEmbrace(table);

    const template = Template.fromStack(stack).toJSON() as any;
    const outputs = template.Outputs ?? {};

    // Expect exactly two outputs: one for tableArn and one for tableName
    expect(Object.keys(outputs).length).toBe(2);

    // Determine the logical ID of the underlying CfnTable (used in output values).
    const cfnTable = table.node.defaultChild as CfnTable;
    const logicalId = cfnTable.logicalId;

    const expectedArnValue = { 'Fn::GetAtt': [logicalId, 'Arn'] };
    const expectedNameValue = { Ref: logicalId };

    const values = Object.values(outputs) as any[];

    // There should be one output using Fn::GetAtt and one using Ref
    const hasArnOutput = values.some(
      (o) => JSON.stringify(o.Value) === JSON.stringify(expectedArnValue),
    );
    const hasRefOutput = values.some(
      (o) => JSON.stringify(o.Value) === JSON.stringify(expectedNameValue),
    );
    expect(hasArnOutput).toBe(true);
    expect(hasRefOutput).toBe(true);

    // Export names should be plain strings and follow the expected prefix pattern
    values.forEach((o) => {
      expect(typeof o.Export.Name).toBe('string');
      expect(o.Export.Name.startsWith('MyStack:ExportsOutput')).toBe(true);
      // Ensure names are not tokens (assertions template would serialize tokens differently)
      expect(JSON.stringify(o.Export.Name)).toEqual(JSON.stringify(o.Export.Name));
    });
  });

  test('allows explicit exportNames override to be used as-is', () => {
    const app = new App();
    const stack = new Stack(app, 'BridgeStack');
    const table = new Table(stack, 'Events', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
    });

    unsafeResolveDeadlyEmbrace(table, {
      properties: ['tableArn', 'tableName'],
      exportNames: {
        tableArn: 'BridgeAppPersistenceStack:ExportsOutputFnGetAttDeprecatedEventsTableArn',
        tableName: 'BridgeAppPersistenceStack:ExportsOutputRefDeprecatedEventsTable',
      },
    });

    const template = Template.fromStack(stack).toJSON() as any;
    const outputs = template.Outputs ?? {};
    const names = Object.values(outputs).map((o: any) => o.Export.Name);

    expect(names).toContain(
      'BridgeAppPersistenceStack:ExportsOutputFnGetAttDeprecatedEventsTableArn',
    );
    expect(names).toContain('BridgeAppPersistenceStack:ExportsOutputRefDeprecatedEventsTable');
  });
});
