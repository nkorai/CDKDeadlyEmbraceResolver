"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.aws_dynamodb = exports.CfnResource = exports.Stack = exports.App = void 0;
const index_1 = require("../constructs/index");
/**
 * Minimal App class.  In the real CDK this class represents the root
 * of the construct tree.  Our stub simply initialises the root
 * construct and does not implement any CLI behaviour.
 */
class App extends index_1.Construct {
    constructor() {
        super(undefined, 'App');
    }
}
exports.App = App;
/**
 * A simplified Stack implementation.  It keeps track of its name,
 * provides a method for registering exports and exposes a static
 * `of()` helper similar to the real CDK.  Children of the stack
 * assign themselves the same stack reference when they are
 * constructed.
 */
class Stack extends index_1.Construct {
    constructor(scope, id) {
        super(scope, id);
        /**
         * Registered outputs keyed by logical output name.  The CDK uses
         * auto‑generated logical IDs for outputs; we follow the same
         * convention (`Output1`, `Output2`, …).
         */
        this.outputs = {};
        this.stackName = id;
        // In the CDK a stack is also a construct.  Assign the stack
        // reference so that `Stack.of(child)` can retrieve it.
        this.stack = this;
    }
    /**
     * Register an export on this stack.  CloudFormation exports are
     * represented in the Outputs section of the template.  We simulate
     * that here by storing them in the `outputs` map.  The return
     * value mirrors the behaviour of CDK’s `exportValue`, which
     * returns the original token unchanged.
     */
    exportValue(value, options = {}) {
        var _a;
        const name = (_a = options.name) !== null && _a !== void 0 ? _a : '';
        const outputId = `Output${Object.keys(this.outputs).length + 1}`;
        this.outputs[outputId] = { Value: value, Export: { Name: name } };
        return value;
    }
    /**
     * Given a construct, return the stack in which it is defined.  In
     * the real CDK this walks up the construct tree.  Our stub relies
     * on each construct storing a `stack` reference, which is set
     * during construction.
     */
    static of(construct) {
        return construct.stack;
    }
}
exports.Stack = Stack;
/**
 * A stub for the CloudFormation resource base class.  This class
 * exposes a `logicalId` property which is used by the resolver to
 * construct export names.  In a real CDK application logical IDs are
 * generated based on the construct’s path and hashed to ensure
   uniqueness.  Our stub simply uses the id passed to the constructor.
 */
class CfnResource extends index_1.Construct {
    constructor(scope, id) {
        super(scope, id);
        this.logicalId = id;
    }
}
exports.CfnResource = CfnResource;
// Export namespaces corresponding to submodules.  Jest’s moduleNameMapper
// rewrites imports like `aws-cdk-lib/aws-dynamodb` to
// `.../test/stubs/aws-cdk-lib/aws-dynamodb`.
// eslint-disable-next-line @typescript-eslint/no-var-requires
exports.aws_dynamodb = __importStar(require("./aws-dynamodb/index"));
