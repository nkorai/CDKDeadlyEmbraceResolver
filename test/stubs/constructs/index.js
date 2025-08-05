"use strict";
/**
 * A very small subset of the constructs module used for testing.  The
 * real AWS CDK defines an extensive class hierarchy; this stub
 * implements only the APIs required by the library and the tests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Construct = void 0;
class Construct {
    constructor(scope, id) {
        var _a, _b;
        this.id = id !== null && id !== void 0 ? id : '';
        if (scope) {
            this.parent = scope;
            // Propagate the stack from the parent.  Stacks assign themselves
            // to `stack` so all children can retrieve it via `Stack.of()`.
            this.stack = scope.stack;
            // Compute the construct path by joining the parent path and our id.
            const parentPath = (_b = (_a = scope.node) === null || _a === void 0 ? void 0 : _a.path) !== null && _b !== void 0 ? _b : '';
            this.node = { path: parentPath ? `${parentPath}/${id}` : id !== null && id !== void 0 ? id : '' };
        }
        else {
            // Root construct (e.g. App).  At runtime the CDK uses an empty
            // path for the root.  Our tests rely on this for logicalId
            // sanitisation.
            this.node = { path: '' };
            this.stack = this;
        }
    }
}
exports.Construct = Construct;
