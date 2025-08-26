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

    unsafeResolveDeadlyEmbrace(table);

    const template = Template.fromStack(stack).toJSON() as any;
    const outputs = template.Outputs ?? {};

    expect(Object.keys(outputs).length).toBe(2);

    const cfnTable = table.node.defaultChild as CfnTable;
    const logicalId = cfnTable.logicalId;

    const expectedArnValue = { 'Fn::GetAtt': [logicalId, 'Arn'] };
    const expectedNameValue = { Ref: logicalId };

    const values = Object.values(outputs) as any[];

    const hasArnOutput = values.some(
      (o) => JSON.stringify(o.Value) === JSON.stringify(expectedArnValue),
    );
    const hasRefOutput = values.some(
      (o) => JSON.stringify(o.Value) === JSON.stringify(expectedNameValue),
    );
    expect(hasArnOutput).toBe(true);
    expect(hasRefOutput).toBe(true);

    values.forEach((o) => {
      expect(typeof o.Export.Name).toBe('string');
      expect(o.Export.Name.startsWith('MyStack:ExportsOutput')).toBe(true);
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

  // NEW: Ensure outputs use static construct IDs (not Stack.exportValue)
  test('uses static CfnOutput ids (no Stack.exportValue-style "Export..." ids)', () => {
    const app = new App();
    const stack = new Stack(app, 'StaticIdStack');
    const table = new Table(stack, 'Legacy', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    unsafeResolveDeadlyEmbrace(table);

    const template = Template.fromStack(stack).toJSON() as any;
    const outputs = template.Outputs ?? {};
    const outputIds = Object.keys(outputs);

    // Our helper sets ids like "PreserveExport<LogicalIdLike><Suffix>"
    expect(outputIds.length).toBeGreaterThan(0);
    for (const id of outputIds) {
      expect(id.startsWith('PreserveExport')).toBe(true);
      expect(id.startsWith('Export')).toBe(false); // would indicate Stack.exportValue path
      // Defensive: IDs should be CFN-friendly alphanumerics
      expect(/^[A-Za-z0-9]+$/.test(id)).toBe(true);
    }
  });

  // NEW: Regression test for hyphenated stack names & realistic paths
  test('no unresolved tokens in output IDs with hyphenated stack names', () => {
    const app = new App();
    // mirrors "BridgeAppProdStage-BridgeAppPersistenceStack"
    const stack = new Stack(app, 'BridgeAppProdStage-BridgeAppPersistenceStack');
    const table = new Table(stack, 'DeprecatedEventsTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
    });

    unsafeResolveDeadlyEmbrace(table, {
      properties: ['tableArn', 'tableName'],
    });

    const template = Template.fromStack(stack).toJSON() as any;
    const outputs = template.Outputs ?? {};
    const ids = Object.keys(outputs);

    // Synthesis would have thrown already if an unresolved Token were used in the ID.
    expect(ids.length).toBe(2);

    // Extra guard: ensure IDs are plain strings with no suspicious substrings
    for (const id of ids) {
      expect(typeof id).toBe('string');
      expect(id.includes('Token[')).toBe(false);
      expect(id.startsWith('PreserveExport')).toBe(true);
    }

    // And export names still follow the prefix
    for (const o of Object.values(outputs) as any[]) {
      expect(
        (o as any).Export.Name.startsWith(
          'BridgeAppProdStage-BridgeAppPersistenceStack:ExportsOutput',
        ),
      ).toBe(true);
    }
  });
});
