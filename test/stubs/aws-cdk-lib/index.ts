// test/stubs/aws-cdk-lib/index.ts
import { Construct } from '../constructs/index';

/**
 * Extremely small Token stub.
 */
const TOKEN_SYMBOL = Symbol.for('cdk.Token');

export class Token {
  public static isUnresolved(value: any): boolean {
    return typeof value === 'object' && value !== null && (value as any)[TOKEN_SYMBOL] === true;
  }
  public static asString(hint: string = 'Token'): any {
    return {
      [TOKEN_SYMBOL]: true,
      toString() {
        return `Token[${hint}]`;
      },
    };
  }
}

/** Minimal App */
export class App extends Construct {
  constructor() {
    super(undefined, 'App');
  }
}

/** Simplified Stack */
export class Stack extends Construct {
  public readonly stackName: string;
  public readonly outputs: Record<string, { Value: any; Export: { Name: string } }> = {};

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.stackName = id;
    this.stack = this;
  }

  public exportValue(value: any, options: { name?: string } = {}): any {
    const name = options.name ?? '';
    const outputId = `Output${Object.keys(this.outputs).length + 1}`;
    this.outputs[outputId] = { Value: value, Export: { Name: name } };
    return value;
  }

  public static of(construct: any): Stack {
    return construct.stack;
  }
}

/** Minimal CfnResource */
export class CfnResource extends Construct {
  public readonly logicalId: string;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.logicalId = id;
  }
}

/** 🔹 Minimal CfnOutput stub used by the helper */
export interface CfnOutputProps {
  value: any;
  exportName?: string;
  description?: string;
}

export class CfnOutput extends Construct {
  public readonly value: any;
  public readonly exportName?: string;

  constructor(scope: Construct, id: string, props: CfnOutputProps) {
    super(scope, id);
    const stack = Stack.of(scope);
    this.value = props.value;
    this.exportName = props.exportName;

    // Register into the stack’s Outputs using THIS id (static, caller-controlled)
    stack.outputs[id] = {
      Value: this.value,
      Export: { Name: this.exportName ?? '' },
    };
  }
}

// Re-export AWS service stubs used in tests
export * as aws_dynamodb from './aws-dynamodb/index';
