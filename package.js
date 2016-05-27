Package.describe({
  name: 'tomi:accountsui-semanticui-redux',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'Accounts UI for Semantic UI using Redux',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  "i18n-client": '0.0.6'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3');
  api.use('check');
  api.use('ecmascript');
  api.use('accounts-base');
  api.use('accounts-password');

  api.addFiles('dist/stylesheets/main.css', 'client');

  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('tomi:accountsui-semanticui-react');
  api.mainModule('accountsui-semanticui-react-tests.js');
});
