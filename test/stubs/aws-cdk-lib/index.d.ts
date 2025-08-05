import { Construct } from '../constructs/index';
/**
 * Minimal App class.  In the real CDK this class represents the root
 * of the construct tree.  Our stub simply initialises the root
 * construct and does not implement any CLI behaviour.
 */
export declare class App extends Construct {
  constructor();
}
/**
 * A simplified Stack implementation.  It keeps track of its name,
 * provides a method for registering exports and exposes a static
 * `of()` helper similar to the real CDK.  Children of the stack
 * assign themselves the same stack reference when they are
 * constructed.
 */
export declare class Stack extends Construct {
  readonly stackName: string;
  /**
   * Registered outputs keyed by logical output name.  The CDK uses
   * auto‑generated logical IDs for outputs; we follow the same
   * convention (`Output1`, `Output2`, …).
   */
  readonly outputs: Record<
    string,
    {
      Value: any;
      Export: {
        Name: string;
      };
    }
  >;
  constructor(scope: Construct, id: string);
  /**
   * Register an export on this stack.  CloudFormation exports are
   * represented in the Outputs section of the template.  We simulate
   * that here by storing them in the `outputs` map.  The return
   * value mirrors the behaviour of CDK’s `exportValue`, which
   * returns the original token unchanged.
   */
  exportValue(
    value: any,
    options?: {
      name?: string;
    },
  ): any;
  /**
   * Given a construct, return the stack in which it is defined.  In
   * the real CDK this walks up the construct tree.  Our stub relies
   * on each construct storing a `stack` reference, which is set
   * during construction.
   */
  static of(construct: any): Stack;
}
/**
 * A stub for the CloudFormation resource base class.  This class
 * exposes a `logicalId` property which is used by the resolver to
 * construct export names.  In a real CDK application logical IDs are
 * generated based on the construct’s path and hashed to ensure
   uniqueness.  Our stub simply uses the id passed to the constructor.
 */
export declare class CfnResource extends Construct {
  readonly logicalId: string;
  constructor(scope: Construct, id: string);
}
export * as aws_dynamodb from './aws-dynamodb/index';
