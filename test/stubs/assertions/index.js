"use strict";
/**
 * Assertions module stub.  Provides a minimal `Template` class that
 * collects outputs from a stack and allows conversion to a JSON
 * representation.  The real CDK assertions library contains many
 * helpers for validating synthesized templates; only a fraction of
 * that functionality is necessary for the unit tests in this
 * repository.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
class Template {
    constructor(template) {
        this.template = template;
    }
    /**
     * Create a new Template wrapper for a stack.  Reads the stack’s
     * outputs to populate the Outputs section of the synthesized
     * template.
     */
    static fromStack(stack) {
        // Copy the outputs into a structure that resembles a synthesized
        // CloudFormation template.  In a real synthesis the template
        // contains many other sections (Resources, Parameters, etc.).
        const tpl = { Outputs: { ...stack.outputs } };
        return new Template(tpl);
    }
    /**
     * Return the underlying template.  The CDK exposes additional
     * methods (such as `hasResourceProperties`), but those are not
     * needed for our tests.
     */
    toJSON() {
        return this.template;
    }
}
exports.Template = Template;
