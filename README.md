# Introduction

The Accounts UI component based on Redux and Semantic UI.

# Installation

Add the accounts reducer to your list of reducers. From this moment on, your account infor along with the currently logged user will be stored in your store under "accounts" key.

```javascript
import { reducer as accountsReducer } from 'meteor/tomi:accountsui-semanticui-redux';

// import all other reducers

const rootReducer = combineReducers({
  accounts: accountsReducer,
  ...
});
```

# Components

The package adds two different components

* **AccountsView** - is the main accounts component
* **UserView** - is the top menu component for showing the logout / profile button

This is the example on how you can use it in the page:

```javascript
import { AccountsView, UserView } from 'meteor/tomi:accountsui-semanticui-redux';

const component = () => {
  <div>
    <div className="ui inverted blue menu topMenu">
      <a className="header item" href="/"><i className="icon bug"></i>Marking</a>
      <div className="right menu">
        <UserView />
      </div>
    </div>
    <div className="ui page grid">
      <div className="ui column">
        <AccountsView />
      </div>
    </div>
  </div>
}

```

# Limitations

This is a very limited component, that currently support only the "accounts-password" and semantic-ui. If you search for highly customisable component that supports all kinds of ui packages, please go use https://atmospherejs.com/std/accounts-ui

If you wish to expand this package with your UI by rewriting the pure UI components I'm very much keen to accept your PRs.
