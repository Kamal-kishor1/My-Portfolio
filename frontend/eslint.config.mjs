import { defineConfig } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
export default defineConfig([
  { ignores: ['node_modules/**', 'dist/**', '.next/**', 'app/**'] },
  { files: ['**/*.{ts,tsx}'], languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' } } },
]);
