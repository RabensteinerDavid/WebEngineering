import love from 'eslint-config-love';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    ...love,
    files: ['**/*.js', '**/*.ts'],
  },
  prettierRecommended,
];
