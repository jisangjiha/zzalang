// @ts-check
import config from '@seokminhong/configs/eslint';

const configs = [
  ...config({
    envs: ['browser', 'node'],
  }),
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
];

export default configs;
