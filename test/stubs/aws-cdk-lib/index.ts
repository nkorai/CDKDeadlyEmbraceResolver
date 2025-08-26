import { Construct } from '../constructs/index';

/**
 * Extremely small Token stub. In real CDK, Tokens represent lazily
 * resolved values. Here, we just tag objects created via `Token.asString`
 * and detect them with `Token.isUnresolved`.
 */
const TOKEN_SYMBOL = Symbol.for('cdk.Token');

export class Token {
  /** Returns true if the value is a stubbed Token created by this module. */
  public static isUnresolved(value: any): boolean {
    return typeof value === 'object' && value !== null && (value as any)[TOKEN_SYMBOL] === true;
  }

  /**
   * Create a stubbed token value. Useful in tests if you want to ensure
   * code paths treat a value as an unresolved token.
   */
  public static asString(hint: string = 'Token'): any {
    return {
      [TOKEN_SYMBOL]: true,
      toString() {
        return `Token[${hint}]`;
      },
    };
  }
}

/**
 * Minimal App class. In the real CDK this represents the root of the construct tree.
 */
export class App extends Construct {
  constructor() {
    super(undefined, 'App');
  }
}

/**
 * A simplified Stack implementation.
 */
export class Stack extends Construct {
  public readonly stackName: string;

  /**
   * Registered outputs keyed by logical output name (Output1, Output2, ...).
   */
  public readonly outputs: Record<string, { Value: any; Export: { Name: string } }> = {};

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.stackName = id;
    // In CDK a stack is also a construct. Assign the stack reference so Stack.of(child) works.
    this.stack = this;
  }

  /**
   * Register an export on this stack. Mirrors `exportValue` by returning the input value.
   */
  public exportValue(value: any, options: { name?: string } = {}): any {
    const name = options.name ?? '';
    const outputId = `Output${Object.keys(this.outputs).length + 1}`;
    this.outputs[outputId] = { Value: value, Export: { Name: name } };
    return value;
  }

  /**
   * Return the stack in which a construct is defined.
   */
  public static of(construct: any): Stack {
    return construct.stack;
  }
}

/**
 * A stub for the CloudFormation resource base class.
 * Exposes a `logicalId` (string) used by tests and helpers.
 */
export class CfnResource extends Construct {
  public readonly logicalId: string;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.logicalId = id;
  }
}

// Export namespaces corresponding to submodules. Jest’s moduleNameMapper
// rewrites imports like `aws-cdk-lib/aws-dynamodb` to this stub tree.
// eslint-disable-next-line @typescript-eslint/no-var-requires
export * as aws_dynamodb from './aws-dynamodb/index';
