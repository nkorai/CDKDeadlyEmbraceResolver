# CDKDeadlyEmbraceResolver

**Experimental utility to safely resolve and remove CDK cross-stack references.**  
**Use only during migration. Remove once stacks are fully decoupled.**

## 🚨 Why this exists

In AWS CDK, passing constructs between stacks creates automatic CloudFormation exports (`Fn::ImportValue`) and outputs. These cross-stack references simplify development—but become a problem when you try to remove them.

You’ll hit the dreaded error:

> _"Export cannot be deleted as it is in use by another stack."_

This scenario is known as the **deadly embrace**.

### 💥 The problem

To safely remove a cross-stack reference, you must:

1. Remove the reference from the **consuming** stack.
2. Retain the export in the **producing** stack temporarily.
3. Deploy both stacks.
4. Then remove the now-unused export from the producing stack.

Manually replicating CDK's internal export names and creating “dummy” exports is painful.

## ✅ What this library does

`CDKDeadlyEmbraceResolver` helps you cleanly break the deadly embrace by generating matching exports one last time.

```ts
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { unsafeResolveDeadlyEmbrace } from 'cdk-deadly-embrace-resolver';

const table = new Table(this, 'MyTable', {
  /* your config */
});

// When removing the last cross-stack reference to `table`, do this:
unsafeResolveDeadlyEmbrace(table);
```

This utility inspects the construct, finds commonly exported properties (like `tableArn`, `tableName`), and registers deterministic exports based on the logical ID.

### 🔁 Required follow-up

Once you introduce `unsafeResolveDeadlyEmbrace` in your producing stack:

- You **must** remove all references to the construct from **every other stack** that previously consumed it.
- You must also **remove any lingering references** to the construct within the producing stack itself.
- Only then can you deploy both stacks successfully before later cleaning up the dummy exports.

### ⚠️ Important caveats

- Export names **may not exactly match** the ones CDK generated before. For typical resources like DynamoDB or S3, defaults should work. Run `cdk synth` to verify.
- This helper is **not a long-term solution**. Remove it once your consuming stack has been deployed without the reference.
- See the [End of Line blog post](https://www.endoflineblog.com/cdk-tips-03-how-to-unblock-cross-stack-references) for background.

## 📦 API

### `unsafeResolveDeadlyEmbrace(resource: IConstruct, options?: UnsafeResolveOptions): void`

Adds exports to the stack containing the given construct.

#### Parameters

| Name          | Type                                  | Description                                                  |
| ------------- | ------------------------------------- | ------------------------------------------------------------ |
| `resource`    | `IConstruct`                          | The construct you're removing references to.                 |
| `properties`  | `string[]` _(optional)_               | Properties to export. Defaults to `*Arn` and `*Name` fields. |
| `exportNames` | `Record<string, string>` _(optional)_ | Map of property name to custom export name.                  |

### Returns

Nothing. This function operates via side effect.

## 🛠️ Development

This repo uses TypeScript, Jest, ESLint, and Prettier.

```sh
# Install dependencies
npm install

# Run tests
npm test

# Compile to dist/
npm run build

# Fix formatting/lint errors
npm run lint:fix
npm run format
```

## 🪪 License

MIT
