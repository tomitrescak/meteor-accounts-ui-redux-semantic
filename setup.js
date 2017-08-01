const html = require('js-beautify').html;
const gql = require('graphql-tag');

function setup({config, wallaby } = {}) {
  config = config || require('chai-match-snapshot/config').config;

  if (wallaby) {
    setupWallaby(config, wallaby);
  }
  setupGlobals(config);
  setupSnapshots(config);
  setupSerialiser(config);
  setupJsDom();
  setupEnzyme();
  setupChai();
}

function setupSnapshots(config) {
  config.snapshotDir = 'src/tests/snapshots';
  config.snapshotExtension = 'json';
  // console.log(config.snapshotDir);
}

function setupJsDom() {
  require('jsdom-global')();

  window.localStorage = {};

  // const jsdom = require('jsdom').jsdom;

  // global.document = jsdom('');
  // global.window = document.defaultView;
  // global.navigator = {
  //   userAgent: 'node.js'
  // };

  // function copyProps(src, target) {
  //   const props = Object.getOwnPropertyNames(src)
  //     .filter(prop => typeof target[prop] === 'undefined')
  //     .map(prop => Object.getOwnPropertyDescriptor(src, prop));
  //   Object.defineProperties(target, props);
  // }
  // copyProps(document.defaultView, global);

  // const { JSDOM } = require('jsdom');
  // const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
  // const { window } = jsdom;

  // function copyProps(src, target) {
  //   const props = Object.getOwnPropertyNames(src)
  //     .filter(prop => typeof target[prop] === 'undefined')
  //     .map(prop => Object.getOwnPropertyDescriptor(src, prop));
  //   Object.defineProperties(target, props);
  // }

  // global.window = window;
  // global.document = window.document;
  // global.navigator = {
  //   userAgent: 'node.js'
  // };
  // copyProps(window, global);
}

function setupWallaby(config, wallaby) {
  var mocha = wallaby.testFramework;
  config = config;

  mocha.suite.on('pre-require', function(context) {
    const origIt = context.it;
    context.config = function() {};
    context.it = function(name, impl) {
      return origIt.call(this, name, function() {
        try {
          let topParent = '';
          let name = this.test.title;
          let parent = this.test.parent;
          let parentName = '';
          while (parent != null) {
            name = parent.title + ' ' + name;
            parentName = parent.title + parentName;
            if (parent.title) {
              topParent = parent.title;
            }
            parent = parent.parent;
          }

          config.currentTask = {
            className: topParent,
            title: this.test.title
          };
          config.snapshotCalls = null;
          // console.log('!!!!!!!!!!!!!!!!');
          // console.log(TestConfig.currentTask);
          return impl();
        } catch (ex) {
          throw ex;
        }
      });
    };
  });
}


function setupSerialiser(config) {
  let originalSerializer = config.serializer;
  config.serializer = obj => {
    if (obj.html) {
      return html(obj.html().replace(/ ;/g, ';'), {
        indent_size: 2
      });
    } else {
      return originalSerializer(obj);
    }
  };
}

function setupEnzyme() {
  const ShallowWrapper = require('enzyme/build/ShallowWrapper').default;
  const ReactWrapper = require('enzyme/build/ReactWrapper').default;

  ShallowWrapper.prototype.change = function(value) {
    change(this, value);
  };
  ReactWrapper.prototype.change = function(value) {
    change(this, value);
  };

  function change(wrapper, value) {
    wrapper.simulate('change', {
      target: {
        value
      }
    });
    wrapper.node.value = value;
  }
  ShallowWrapper.prototype.select = function(number) {
    select(this, number);
  };
  ReactWrapper.prototype.select = function(number) {
    select(this, number);
  };

  function select(wrapper, value) {
    const Dropdown = require('semantic-ui-react').Dropdown;
    if (wrapper.find(Dropdown.Item).length > 0) {
      let items = wrapper.simulate('click').find(Dropdown.Item);
      if (value > items.length - 1) {
        throw new Error(
          `You are selecting index #${value} in your Dropdown, while only ${items.length} Dropdown.Items are available`
        );
      }
      items.at(value).simulate('click');
    } else {
      wrapper.parent().find('Dropdown').find(Dropdown.Item).at(value).simulate('click');
    }
  }
}


function setupChai() {
  // setup chai

  const chai = require('chai');
  const sinonChai = require('sinon-chai');
  const chaiEnzyme = require('chai-enzyme');
  const chaiMatchSnapshot = require('chai-match-snapshot').chaiMatchSnapshot;
  // const should = global.FuseBox ? FuseBox.import('fuse-test-runner').should : require('fuse-test-runner').should;

  chai.should();
  chai.use(sinonChai);
  chai.use(chaiEnzyme());
  chai.use(chaiMatchSnapshot);
}

function setupGlobals() {
  global.navigator = {
    userAgent: 'node.js'
  };

  global.action = () => {};

  // setup globals

  const i18n = require('es2015-i18n-tag').default;
  global.i18n = i18n;
  global.gql = gql;
}

function transform(content, name) {
  var classReg = /export\s+class\s+(\w+Test)/g;
  name = name || '.';

  var matches = classReg.exec(content);

  if (matches) {
    content += `
const TestConfig = require('fuse-test-runner').TestConfig;
function getAllFuncs(obj) {
    let props = [];
    do {
        props = props.concat(Object.getOwnPropertyNames(obj).filter(
            w => typeof obj[w] === 'function' && w !== 'constructor' && props.indexOf(w) === -1));
        obj = Object.getPrototypeOf(obj);
    } while (obj.constructor.name !== 'Object');
    return props;
}

function __runTests(test, className) {
  for (let method of getAllFuncs(test)) {
    if (typeof test[method] === 'function' && method.match(/${name}/)) {
      if (method === 'beforeEach' || method === 'afterEach') {
        test[method]();
      } else {
        it(method.trim(), async function () {
          TestConfig.currentTask = {
            className,
            title: method
          }
          TestConfig.snapshotCalls = null;
          await test[method]();
        });
      }
    }
  }
} 
`;
    while (matches) {
      content += `__runTests(new ${matches[1]}(), '${matches[1]}');\n`;
      matches = classReg.exec(content);
    }
  }

  return content;
}

function setupLuis() {
  const testConfig = require('chai-match-snapshot').config;

  setupSerialiser(testConfig);
  setupEnzyme();
  setupChai();
}

module.exports = {
  setup,
  setupGlobals,
  setupLuis,
  transform
};
