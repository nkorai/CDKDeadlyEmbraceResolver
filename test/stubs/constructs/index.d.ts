/**
 * A very small subset of the constructs module used for testing.  The
 * real AWS CDK defines an extensive class hierarchy; this stub
 * implements only the APIs required by the library and the tests.
 */
export interface IConstruct {}
export declare class Construct implements IConstruct {
  /**
   * Each construct has a node that tracks metadata, including its path in
   * the construct tree and an optional default child.  The AWS CDK
   * attaches numerous properties here, but our stub only needs
   * `path` and `defaultChild` to satisfy the library’s `unsafeResolveDeadlyEmbrace`.
   */
  readonly node: {
    path: string;
    defaultChild?: any;
  };
  stack?: any;
  parent?: Construct;
  id: string;
  constructor(scope?: Construct, id?: string);
}
