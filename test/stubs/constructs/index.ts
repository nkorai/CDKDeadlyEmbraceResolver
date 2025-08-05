/**
 * A very small subset of the constructs module used for testing.  The
 * real AWS CDK defines an extensive class hierarchy; this stub
 * implements only the APIs required by the library and the tests.
 */

// tslint:disable-next-line:no-empty-interface
export interface IConstruct {}

export class Construct implements IConstruct {
  /**
   * Each construct has a node that tracks metadata, including its path in
   * the construct tree and an optional default child.  The AWS CDK
   * attaches numerous properties here, but our stub only needs
   * `path` and `defaultChild` to satisfy the library’s `unsafeResolveDeadlyEmbrace`.
   */
  public readonly node: { path: string; defaultChild?: any };
  public stack?: any;
  public parent?: Construct;
  public id: string;
  constructor(scope?: Construct, id?: string) {
    this.id = id ?? '';
    if (scope) {
      this.parent = scope;
      // Propagate the stack from the parent.  Stacks assign themselves
      // to `stack` so all children can retrieve it via `Stack.of()`.
      this.stack = scope.stack;
      // Compute the construct path by joining the parent path and our id.
      const parentPath = scope.node?.path ?? '';
      this.node = { path: parentPath ? `${parentPath}/${id}` : (id ?? '') };
    } else {
      // Root construct (e.g. App).  At runtime the CDK uses an empty
      // path for the root.  Our tests rely on this for logicalId
      // sanitisation.
      this.node = { path: '' };
      this.stack = this;
    }
  }
}
