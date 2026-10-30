import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:ui',
                'type:data',
                'type:realtime',
                'type:state',
                'type:utils',
              ],
            },
            {
              sourceTag: 'type:server',
              onlyDependOnLibsWithTags: ['type:data', 'type:utils'],
            },
            { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:utils'] },
            {
              sourceTag: 'type:data',
              onlyDependOnLibsWithTags: ['type:utils'],
            },
            {
              sourceTag: 'type:realtime',
              onlyDependOnLibsWithTags: ['type:data', 'type:utils'],
            },
            {
              sourceTag: 'type:state',
              onlyDependOnLibsWithTags: ['type:data', 'type:utils'],
            },
            { sourceTag: 'type:utils', onlyDependOnLibsWithTags: [] },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
