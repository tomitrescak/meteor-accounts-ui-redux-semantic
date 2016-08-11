import {Meteor} from "meteor/meteor";
import {Tracker} from "meteor/tracker";
import {Accounts} from "meteor/accounts-base";
import { __, i18n } from "i18n-client";
import methodStubs from "./method_stubs/accounts";
import accountsConfig from "./accounts_config";
import i18nConfig from "./i18n";
import actions from "../actions/accounts";
import { Roles } from "meteor/alanning:roles";

// import "../stylesheets/main";

declare global {
  export interface IAccountsUiContext {
    Meteor: typeof Meteor;
    Accounts: typeof Accounts;
    i18n: typeof i18n;
    __: typeof __;
    dispatch: IAccountsUiIDispatch
  }

  export interface IAccountsUIAsyncCallback {
    (err: Error, result: any): void;
  }

  export interface IAccountsUiIDispatch {
    (actionCreator: any): void;
  }

  export interface IAccountsUiMeteor {
    call(...params: any[]): void;
    loginWithPassword(login: string, password: string, callback: IAccountsUIAsyncCallback): void;
    logout(callback: IAccountsUIAsyncCallback): void;
    user(): Meteor.User;
  }

  export interface IAccountsUiAccounts {
    forgotPassword(email: Object, callback: IAccountsUIAsyncCallback): any;
    resetPassword(token: string, password: string, callback: IAccountsUIAsyncCallback): any;
  }
}

let context: IAccountsUiContext = {
  i18n,
  __,
  Meteor,
  Accounts,
  dispatch: null
}

// init package
methodStubs(context);
accountsConfig();
i18nConfig(context);

function dispatch(func: any) {
  if (context.dispatch) {
    context.dispatch(func);
  } else {
    setTimeout(() => dispatch(func), 50);
  }
}

const extensions = (id: string) => {
  return {
    isRole(role: string) {
      return Roles.userIsInRole(id, role);
    },
    isAdmin() {
      return Roles.userIsInRole(id, "admin");
    }
  };
};

// init tracker which will monitor the user and dispatch actions when necessary

let muser: Meteor.User = null;
let mloggingIn = false;

Tracker.autorun(() => {
  let user = Meteor.user();
  let loggingIn = Meteor.loggingIn();

  if (loggingIn !== mloggingIn) {
    dispatch(actions.changeLoggingIn(loggingIn));
    mloggingIn = loggingIn;
  }

  if (user) {
    if (!muser) {
      // add role extensions
      user = Object.assign(user, extensions(user._id));

      // add this user to the store
      dispatch(actions.assignUser(user));
    }
  } else {
    if (muser) {
      dispatch(actions.clearUser());
    }
  };
  muser = user;
});

export default context;
