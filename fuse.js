const {
  Sparky,
  FuseBox,
  JSONPlugin,
  CSSPlugin,
  CSSResourcePlugin,
  EnvPlugin,
  WebIndexPlugin,
  UglifyJSPlugin,
  QuantumPlugin
} = require('fuse-box');

const StubPlugin = require('proxyrequire').FuseBoxStubPlugin(/\.tsx?/);
const JsxControlsPugin = require('jsx-controls-loader').fuseBoxPlugin;
const TestConfig = require('fuse-test-runner').TestConfig;
const setup = require('wafl').setup;

/////////////////////////////////////////////
// TEST

Sparky.task('test', () => {
  const testFuse = FuseBox.init({
    homeDir: 'src',
    output: 'dist/$name.js',
    plugins: [
      JsxControlsPugin,
      StubPlugin,
      // JSONPlugin(),
      EnvPlugin({ NODE_ENV: 'test' })
    ],
    globals: {
      proxyrequire: '*'
    },
    shim: {
      crypto: {
        exports: '{ randomBytes: () => Math.random(8) }'
      }
    }
  });

  // setup();
  require('wafl').setupGlobals();

  testFuse
    .bundle('app')
    //.plugin(StubPlugin)
    //.globals({ proxyrequire: '*' })
    .test('[**/**.test.tsx]', {
      beforeAll(config) {
        setup(config);
      }
    });
});

/////////////////////////////////////////////
// LUIS

Sparky.task('luis', () => {
  const luisFuse = FuseBox.init({
    homeDir: 'src',
    output: 'public/$name.js',
    plugins: [
      JsxControlsPugin,
      JSONPlugin(),
      CSSPlugin({
        group: 'luis.css',
        outFile: `public/styles/luis.css`,
        inject: false
      }),
      // WebIndexPlugin({ template: 'src/luis/luis.html' }),
      // WebIndexPlugin(),
    ],
    shim: {
      crypto: {
        exports: '{ randomBytes: () => crypto.getRandomValues(new global.Uint16Array(1))[0] }'
      }
    }
  });

  luisFuse.dev({
    port: 4445,
    httpServer: false
  });

  luisFuse
    .bundle('luis-vendor')
    .target("browser")
    .hmr()
    .instructions(' ~ luis/client.ts +proxyrequire'); // nothing has changed here

  luisFuse
    .bundle('luis-client')
    .target("browser")
    .watch() // watch only client related code
    .hmr()
    .sourceMaps(true)
    .plugin([StubPlugin, JsxControlsPugin])
    .globals({
      proxyrequire: '*'
    })
    .instructions(' !> [luis/client.ts]');

  luisFuse.run();

  // server

  // luisFuse
  const serverFuse = FuseBox.init({
    homeDir: 'src',
    output: 'public/$name.js'
  });
  serverFuse
    .bundle('luis-server')
    // .watch('luis/server/**') // watch only server related code.. bugs up atm
    .instructions(' > [luis/server.ts]')
    // Execute process right after bundling is completed
    // launch and restart express
    .completed(proc => proc.start());

    serverFuse.run();
});
