const path = require('path');
const transform = require('jsx-controls-loader').loader;

module.exports = function(wallaby) {
  // var load = require;

  return {
    files: [
      'src/**/*.ts*',
      '!**/luis.ts',
      '!src/**/*.test.tsx',
      '!src/**/*.test.ts',
      '!src/**/*.d.ts*'
    ],
    tests: ['src/**/*.test.tsx', 'src/**/*.test.ts', 'src/**/snapshots/*.json'],
    compilers: {
      '**/*.ts?(x)': wallaby.compilers.typeScript({ jsx: 'react', module: 'commonjs' })
    },
    preprocessors: {
      // '**/*.ts': file => transform(file.content),
      // '**/*.tsx': file => transform(jsxtransform(file.content))
      '**/*.tsx': file => transform(file.content)
    },
    env: {
      type: 'node',
      runner: '/usr/local/bin/node'
    },
    testFramework: 'mocha',
    setup: function(wallaby) {     
      require('wafl').setup(null, wallaby);
    }
  };
};
