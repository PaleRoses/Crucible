import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Add Panda CSS plugin configuration
    plugins: ['@pandacss'],
    rules: {
      // You can enable specific rules here, for example:
      // '@pandacss/valid-token': 'error',
      // '@pandacss/no-unknown-token': 'warn'
    }
  }
];

export default eslintConfig;