import { trimInput, isEmail, isNotEmpty, isValidPassword, areValidPasswords } from "../configs/helpers";

export const CLEAR_MESSAGES = "ACCOUNTS: Clear Messages";
export const SHOW_SIGNIN = "ACCOUNTS: Show Signin";
export const SHOW_REGISTER = "ACCOUNTS: Show Register";
export const SHOW_VERIFICATION = "ACCOUNTS: Show Verification";
export const SHOW_FORGOT = "ACCOUNTS: Show Forgot Password";
export const CLEAR_USER = "ACCOUNTS: Clear User";
export const ASSIGN_USER = "ACCOUNTS: Assign User";
export const SET_TOKEN = "ACCOUNTS: Set Token";
export const CHANGE_LOGGING_IN = "ACCOUNTS: Change Logging In";

export const SHOW_ERROR = "ACCOUNTS_ERROR";
export const SHOW_MESSAGE = "ACCOUNTS_MESSAGE";

const actions = {
  clearMessages() {
    return { type: CLEAR_MESSAGES };
  },
  showError(message: string) {
    return { type: SHOW_ERROR, message: message };
  },
  showInfo(message: string) {
    return { type: SHOW_MESSAGE, message: message };
  },
  showSignin() {
    return { type: SHOW_SIGNIN };
  },
  showRegister() {
    return { type: SHOW_REGISTER };
  },
  showVerification() {
    return { type: SHOW_VERIFICATION };
  },
  showForgotPassword() {
    return { type: SHOW_FORGOT };
  },
  assignUser(user: any) {
    return { type: ASSIGN_USER, user };
  },
  changeLoggingIn(loggingIn: boolean) {
    return { type: CHANGE_LOGGING_IN, loggingIn };
  },
  clearUser() {
    return { type: CLEAR_USER };
  },
  setToken(token: string) {
    return { type: SET_TOKEN, token };
  },
  signOut({ Meteor }: IAccountsUiContext) {
    return function(dispatch: IAccountsUiIDispatch) {
      signOut(Meteor, dispatch);
    };
  },
  signIn({ Meteor }: IAccountsUiContext, email: string, password: string, callback: Function) {
    return function(dispatch: IAccountsUiIDispatch) {
      signIn(dispatch, Meteor, email, password, callback);
    };
  },
  resendVerification({ Meteor }: IAccountsUiContext, email: string, callback: Function) {
    return function(dispatch: IAccountsUiIDispatch) {
      resendVerification(dispatch, Meteor, email, callback);
    };
  },
  emailResetLink({ Accounts }: IAccountsUiContext, email: string, callback: Function) {
    return function(dispatch: IAccountsUiIDispatch) {
      emailResetLink(dispatch, Accounts, email, callback);
    };
  },
  resetPassword({ Accounts }: IAccountsUiContext, passwordResetToken: string, password: string, passwordConfirm: string, callback: IAccountsUIAsyncCallback) {
    return function(dispatch: IAccountsUiIDispatch) {
      resetPassword(dispatch, Accounts, passwordResetToken, password, passwordConfirm, callback);
    };
  },
  register({ Meteor, Accounts }: IAccountsUiContext, name: string, email: string, password: string, passwordConfirm: string, callback: IAccountsUIAsyncCallback) {
    return function(dispatch: IAccountsUiIDispatch) {
      register(dispatch, Meteor, Accounts, name, email, password, passwordConfirm, callback);
    };
  }
};

function errorDispatch(dispatch: IAccountsUiIDispatch) {
  return (message: string) => {
    dispatch(actions.showError(message));
  };
}

function signIn(dispatch: IAccountsUiIDispatch, Meteor: IAccountsUiMeteor, email: string, password: string, callback: Function): any {
  dispatch(actions.clearMessages());

  const ed = errorDispatch(dispatch);
  email = trimInput(email.toLowerCase());

  if (!isNotEmpty(ed, email) || !isEmail(ed, email) || !isNotEmpty(ed, password) || !isValidPassword(ed, password)) {
    return;
  }

  Meteor.loginWithPassword(email, password, function(err: any) {
    callback();

    if (err) {
      dispatch(actions.showError("accounts.error.invalidCredentials"));
    } else {
      // this is done automatically now in the tracker
      // dispatch(actions.assignUser(Meteor.user()));
    }
  });
}

function signOut(Meteor: IAccountsUiMeteor, dispatch: IAccountsUiIDispatch) {
  dispatch(actions.clearMessages());

  Meteor.logout(function() {
    // done automatically in the tracker
    // dispatch(actions.clearUser());
  });
}

function resendVerification(dispatch: IAccountsUiIDispatch, Meteor: IAccountsUiMeteor, email: string, callback: Function) {
  const ed = errorDispatch(dispatch);

  if (!isNotEmpty(ed, email) || !isEmail(ed, email)) {
    return;
  }

  Meteor.call("sendVerification", email, function(err: any) {
    callback();

    if (err) {
      if (err.message === "User not found [403]") {
        dispatch(actions.showError("accounts.error.emailNotFound"));
      } if (err.message === "User already verified [403]") {
        dispatch(actions.showError("accounts.error.userAlreadyVerified"));
      } else {
        dispatch(actions.showError("accounts.error.unknownError"));
      }
    } else {
      dispatch(actions.showInfo("accounts.messages.verificationEmailSent"));
    }
  });

}

function emailResetLink(dispatch: IAccountsUiIDispatch, Accounts: IAccountsUiAccounts, email: string, callback: Function) {
  const ed = errorDispatch(dispatch);

  if (!isNotEmpty(ed, email) || !isEmail(ed, email)) {
    return;
  }

  Accounts.forgotPassword({ email: email }, function(err: any) {
    callback();

    if (err) {
      if (err.message === "User not found [403]") {
        dispatch(actions.showError("accounts.error.emailNotFound"));
      } else {
        dispatch(actions.showError("accounts.error.unknownError"));
      }
    } else {
      dispatch(actions.showError("accounts.messages.passwordResetEmailSent"));
    }
  });
}

function resetPassword(dispatch: IAccountsUiIDispatch, Accounts: IAccountsUiAccounts, token: string, password: string, passwordConfirm: string, callback: Function): void {
  const ed = errorDispatch(dispatch);

  if (!isNotEmpty(ed, password) || areValidPasswords(ed, password, passwordConfirm)) {
    return;
  }

  Accounts.resetPassword(token, password, function(err: any) {
    if (err) {
      if (err.message === "Token expired [403]") {
        ed("accounts.error.tokenExpired");
      } else {
        ed(err.message);
      }
    } else {
      dispatch(actions.showInfo("accounts.messages.passwordChanged"));
      dispatch(actions.showSignin());
    }
    callback();
  });

}

function register(dispatch: IAccountsUiIDispatch, Meteor: IAccountsUiMeteor, Accounts: IAccountsUiAccounts, name: string, email: string, password: string, passwordConfirm: string, callback: any) {
  const ed = errorDispatch(dispatch);

  let data = {
    email: email,
    password: password,
    profile: {
      name: name
    }
  };

  if (!isNotEmpty(ed, email) || !isNotEmpty(ed, password) || !isEmail(ed, email) || !areValidPasswords(ed, password, passwordConfirm)) {
    return;
  }

  Meteor.call("addUser", data, function(err: any, id: string) {
    callback();

    if (err) {
      if (err.message === "Email already exists. [403]") {
        ed("accounts.error.emailAlreadyExists");
      } else if (err.message === "Email doesn\"t match the criteria. [403]") {
        ed("accounts.error.emailLimited");
      } else if (err.message === "Login forbidden [403]") {
        ed("accounts.error.loginForbidden");
      } else {
        ed("accounts.error.unknownError");
      }
    } else {
      if (id) {
        signIn(dispatch, Meteor, email, password, () => {});
      } else {
        dispatch(actions.showInfo("accounts.messages.verificationSent"));
      }
    }
  });

}

export default actions;
