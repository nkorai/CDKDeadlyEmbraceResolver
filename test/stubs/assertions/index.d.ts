/**
 * Assertions module stub.  Provides a minimal `Template` class that
 * collects outputs from a stack and allows conversion to a JSON
 * representation.  The real CDK assertions library contains many
 * helpers for validating synthesized templates; only a fraction of
 * that functionality is necessary for the unit tests in this
 * repository.
 */
export declare class Template {
  private readonly template;
  private constructor();
  /**
   * Create a new Template wrapper for a stack.  Reads the stack’s
   * outputs to populate the Outputs section of the synthesized
   * template.
   */
  static fromStack(stack: any): Template;
  /**
   * Return the underlying template.  The CDK exposes additional
   * methods (such as `hasResourceProperties`), but those are not
   * needed for our tests.
   */
  toJSON(): any;
}
