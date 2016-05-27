// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by accountsui-semanticui-react.js.
import { name as packageName } from "meteor/accountsui-semanticui-react";

// Write your tests here!
// Here is an example.
Tinytest.add('accountsui-semanticui-react - example', function (test) {
  test.equal(packageName, "accountsui-semanticui-react");
});
