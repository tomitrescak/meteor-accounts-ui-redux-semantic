const setup = require('./setup').setup;

function setupMocha() {
  var TestConfig = require('fuse-test-runner').TestConfig;
  var Mocha = require('mocha');
  var Suite = require('mocha/lib/suite');
  var Test = require('mocha/lib/test');

  /**
 * This example is identical to the TDD interface, but with the addition of a
 * "comment" function:
 * https://github.com/mochajs/mocha/blob/master/lib/interfaces/tdd.js
 */
  module.exports = Mocha.interfaces['fuse'] = function(suite) {
    var suites = [suite];

    suite.on('pre-require', function(context, file, mocha) {
      var common = require('mocha/lib/interfaces/common')(suites, context);

      /**
     * Use all existing hook logic common to UIs. Common logic can be found in
     * https://github.com/mochajs/mocha/blob/master/lib/interfaces/common.js
     */
      context.beforeEach = common.beforeEach;
      context.afterEach = common.afterEach;
      context.before = common.before;
      context.after = common.after;
      context.describe = common.describe;
      context.run = mocha.options.delay && common.runWithSuite(suite);

      context.describe = context.context = function(title, fn) {
        return common.suite.create({
          title: title,
          file: file,
          fn: fn
        });
      };

      /**
     * Pending describe.
     */

      context.xdescribe = context.xcontext = context.describe.skip = function(title, fn) {
        return common.suite.skip({
          title: title,
          file: file,
          fn: fn
        });
      };

      /**
     * Exclusive suite.
     */

      context.describe.only = function(title, fn) {
        return common.suite.only({
          title: title,
          file: file,
          fn: fn
        });
      };

      /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

      /**
     * Exclusive test-case.
     */

      context.it.only = function(title, fn) {
        return common.test.only(mocha, context.it(title, fn));
      };

      /**
     * Pending test case.
     */

      context.xit = context.xspecify = context.it.skip = function(title) {
        context.it(title);
      };

      /**
     * Number of attempts to retry.
     */
      context.it.retries = function(n) {
        context.retries(n);
      };

      context.config = function() {};

      context.it = context.specify = function(title, fn) {
        var suite = suites[0];
        var newFn = function() {
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

            TestConfig.currentTask = {
              className: topParent,
              title: this.test.title
            };
            TestConfig.snapshotCalls = null;
            // console.log('!!!!!!!!!!!!!!!!');
            // console.log(TestConfig.currentTask);
            return fn();
          } catch (ex) {
            throw ex;
          }
        }
        if (suite.isPending()) {
          newFn = null;
        }
        var test = new Test(title, newFn);
        test.file = file;
        suite.addTest(test);
        return test;
      };
    });
  };
}

setup();
setupMocha();