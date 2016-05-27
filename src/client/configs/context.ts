import {Meteor} from "meteor/meteor";
import {Tracker} from "meteor/tracker";
import {Accounts} from "meteor/accounts-base";
import { __, i18n } from "i18n-client";
import methodStubs from "./method_stubs/accounts";
import accountsConfig from "./accounts_config";
import i18nConfig from "./i18n";
import actions from "../actions/accounts";

// import "../stylesheets/main";

declare global {
  export interface IContext {
    Meteor: typeof Meteor;
    Accounts: typeof Accounts;
    i18n: typeof i18n;
    __: typeof __;
    dispatch: IDispatch
  }

  export interface IAsyncCallback {
    (err: Error, result: any): void;
  }

  export interface IDispatch {
    (actionCreator: any): void;
  }

  export interface IMeteor {
    call(...params: any[]): void;
    loginWithPassword(login: string, password: string, callback: IAsyncCallback): void;
    logout(callback: IAsyncCallback): void;
    user(): Meteor.User;
  }

  export interface IAccounts {
    forgotPassword(email: Object, callback: IAsyncCallback): any;
    resetPassword(token: string, password: string, callback: IAsyncCallback): any;
  }
}

let context: IContext = {
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

// init tracker which will monitor the user and dispatch actions when necessary

let muser: Meteor.User = null;
Tracker.autorun(() => {
  const user = Meteor.user();

  if (user) {
    if (!muser) {
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
