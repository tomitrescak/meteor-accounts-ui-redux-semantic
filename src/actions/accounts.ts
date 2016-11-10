import { trimInput, isEmail, isNotEmpty, isValidPassword, areValidPasswords } from '../configs/helpers';
import i18n from 'es2015-i18n-tag';

import { mutation } from 'apollo-mantra';

export const LOGOUT = 'ACCOUNTS: Logout';
export const LOGIN = 'ACCOUNTS: Login';
export const CLEAR_MESSAGES = 'ACCOUNTS: Clear Messages';
export const SHOW_SIGNIN = 'ACCOUNTS: Show Signin';
export const SHOW_REGISTER = 'ACCOUNTS: Show Register';
export const SHOW_VERIFICATION = 'ACCOUNTS: Show Verification';
export const SHOW_FORGOT = 'ACCOUNTS: Show Forgot Password';
export const SHOW_RESET_PASSWORD = 'ACCOUNTS: Show Reset Password';
export const SET_TOKEN = 'ACCOUNTS: Set Token';
export const CHANGE_LOGGING_IN = 'ACCOUNTS: Change Logging In';

export const SHOW_ERROR = 'ACCOUNTS_ERROR';
export const SHOW_MESSAGE = 'ACCOUNTS_MESSAGE';

export const config = {
  profileData: 'name'
};

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
  showResetPassword() {
    return { type: SHOW_RESET_PASSWORD };
  },
  changeLoggingIn(loggingIn: boolean) {
    return { type: CHANGE_LOGGING_IN, loggingIn };
  },
  setToken(token: string) {
    return { type: SET_TOKEN, token };
  },
  logOut() {
    return { type: LOGOUT };
  },
  logIn(data: any) {
    return { type: LOGIN, data };
  },
  signIn(email: string, password: string, profileData: string, callback: Function) {
    return function(dispatch: Function) {
      signIn(dispatch, email, password, profileData, callback);
    };
  },
  resendVerification(email: string, callback: Function) {
    return function(dispatch: Function) {
      resendVerification(dispatch, email, callback);
    };
  },
  emailResetLink(email: string, callback: Function) {
    return function(dispatch: Function) {
      emailResetLink(dispatch, email, callback);
    };
  },
  resetPassword(passwordResetToken: string, password: string, passwordConfirm: string, profileData: string, callback: Function) {
    return function(dispatch: Function) {
      resetPassword(dispatch, passwordResetToken, password, passwordConfirm, profileData, callback);
    };
  },
  register(name: string, email: string, password: string, passwordConfirm: string, profileData: string, callback: Function) {
    return function(dispatch: Function) {
      register(dispatch, name, email, password, passwordConfirm, profileData, callback);
    };
  },
  resume(token: string, tokenExpiration: number, profileData: string) {
    return function(dispatch: Function) {
      resume(dispatch, token, tokenExpiration, profileData);
    };
  },
  verify(token: string, profileData: string) {
    return function(dispatch: Function) {
      verify(dispatch, token, profileData);
    };
  }
};

function errorDispatch(dispatch: Function) {
  return (message: string) => {
    dispatch(actions.showError(message));
  };
}

function resume(dispatch: Function, token: string, tokenExpiration: number, profileData: string) {
  if (new Date().getTime() > tokenExpiration) {
    dispatch(actions.logOut());
    return;
  }

  dispatch(actions.changeLoggingIn(true));

  dispatch(mutation({
    query: `mutation resume($token: String!) {
      resume(token: $token) {
        hashedToken
        expires
        user {
          _id
          profile {
            ${profileData}
          }
          roles
        }
      }
    }`,
    variables: {
      token
    },
    catchCallback: (_error) => {
      dispatch(actions.changeLoggingIn(false));
      dispatch(actions.logOut());
    },
    thenCallback: (data: any) => {
      dispatch(actions.changeLoggingIn(false));
      dispatch(actions.logIn(data.resume));
    }
  }));
}

function signIn(dispatch: Function, email: string, password: string, profileData: string, callback: Function): any {
  dispatch(actions.clearMessages());

  const ed = errorDispatch(dispatch);
  email = trimInput(email.toLowerCase());

  if (!isNotEmpty(ed, email) || !isEmail(ed, email) || !isNotEmpty(ed, password) || !isValidPassword(dispatch, password)) {
    return;
  }

  dispatch(mutation({
    query: `mutation loginWithPassword($user: UserPasswordInput!) {
      loginWithPassword(user: $user) {
        hashedToken
        expires
        user {
          _id
          profile {
            ${profileData}
          }
          roles
        }
      }
    }`,
    variables: {
      user: {
        email,
        password
      }
    },
    catchCallback: (error) => {
      let err = error.message;
      if (error.graphQLErrors) {
        err = error.graphQLErrors[0];
      }

      if (err.message.match(/Email not verified/)) {
        dispatch(actions.showError(i18n`Your email is not verified`));
      } else {
        dispatch(actions.showError(i18n`User of password is invalid`));
      }

      if (callback) { callback(); }
    },
    // errorCallback: (err) => {
    //   dispatch(actions.showError('accounts.error.invalidCredentials'));
    //   if (callback) { callback(); }
    // },
    thenCallback: (data: any) => {
      dispatch(actions.logIn(data.loginWithPassword));
      if (callback) { callback(); }
    }
  }));
}

function resendVerification(dispatch: Function, email: string, callback: Function) {
  const ed = errorDispatch(dispatch);

  if (!isNotEmpty(ed, email) || !isEmail(ed, email)) {
    if (callback) { callback(); }
    return;
  }

  dispatch(mutation({
    query: `mutation requestResendVerification($email: String!) {
      requestResendVerification(email: $email)
    }`,
    variables: {
      email
    },
    catchCallback: (err) => {
      if (err.message.match(/User not found/) || err.message.match(/User email does not exist/)) {
        dispatch(actions.showError(i18n`User with this email does not exist`));
      } else if (err.message.match(/User already verified/)) {
        dispatch(actions.showError(i18n`This user is already verified`));
      } else {
        console.error(err);
        dispatch(actions.showError(i18n`Server error`));
      }
      if (callback) { callback(); }
    },
    thenCallback: (_data: any) => {
      dispatch(actions.showInfo(i18n`We sent you instructions on how to verify your email`));
      if (callback) { callback(); }
    }
  }));
}

function emailResetLink(dispatch: Function, email: string, callback: Function) {
  const ed = errorDispatch(dispatch);

  if (!isNotEmpty(ed, email) || !isEmail(ed, email)) {
    if (callback) { callback(); }
    return;
  }

  dispatch(mutation({
    query: `mutation requestResetPassword($email: String!) {
      requestResetPassword(email: $email)
    }`,
    variables: {
      email
    },
    catchCallback: (error) => {
      let err = error.message;
      if (error.graphQLErrors) {
        err = error.graphQLErrors[0];
      }

      if (err.message.match(/User email does not exist/)) {
        dispatch(actions.showError(i18n`User with this email does not exist!`));
      } else {
        console.error(error);
        dispatch(actions.showError(i18n`Server error`));
      }
      if (callback) { callback(); }
    },
    thenCallback: (_data: any) => {
      dispatch(actions.showInfo(i18n`We sent you an email with password reset instructions`));
      if (callback) { callback(); }
    }
  }));
}

function resetPassword(dispatch: Function, token: string, password: string, passwordConfirm: string, profileData: string, callback: Function): void {
  const ed = errorDispatch(dispatch);

  if (!isNotEmpty(ed, password) || !areValidPasswords(ed, password, passwordConfirm)) {
    return;
  }

  dispatch(mutation({
    query: `mutation resetPassword($token: String!, $password: String!) {
      resetPassword(token: $token, password: $password) {
        hashedToken
        expires
        user {
          _id
          profile {
            ${profileData}
          }
          roles
        }
      }
    }`,
    variables: {
      token,
      password
    },
    catchCallback: (error) => {
      let err = error;
      if (error.graphQLErrors) {
        err = error.graphQLErrors[0];
      }

      if (err.message.match(/jwt expired/)) {
        ed(i18n`Session Expired`);
      } else if (err.message.match(/invalid token/)) {
        ed(i18n`Login prohibited with malformed token`);
      } else if (err.message.match('jwt malformed')) {
        ed(i18n`Login prohibited with malformed token`);
      } else {
        ed(err.message);
      }
      if (callback) { callback(); }
    },
    thenCallback: (data: any) => {
      // dispatch(actions.showInfo('accounts.messages.passwordChanged'));
      const url = location.href.split('?')[0];
      if (history && history.pushState) {
        history.pushState(null, '', url);
        dispatch(actions.logIn(data.resetPassword));
      } else {
        dispatch(actions.logIn(data.resetPassword));
        window.location.href = url;
      }
      if (callback) { callback(); }
    }
  }));
}

function verify(dispatch: Function, token: string, profileData: string): void {
  const ed = errorDispatch(dispatch);

  dispatch(mutation({
    query: `mutation verify($token: String!) {
      verify(token: $token) {
        hashedToken
        expires
        user {
          _id
          profile {
            ${profileData}
          }
          roles
        }
      }
    }`,
    variables: {
      token
    },
    catchCallback: (error) => {
      let err = error.message;
      if (error.graphQLErrors) {
        err = error.graphQLErrors[0];
      }

      if (err.message.match(/jwt expired/)) {
        ed(i18n`Session Expired`);
      } else if (err.message.match(/invalid token/)) {
        ed(i18n`Login prohibited with malformed token`);
      } else if (err.message.match('jwt malformed')) {
        ed(i18n`Login prohibited with malformed token`);
      } else {
        ed(err.message);
      }
    },
    thenCallback: (data: any) => {
      const url = location.href.split('?')[0];
      dispatch(actions.logIn(data.verify));

      if (history && history.pushState) {
        history.pushState(null, '', url);
      } else {
        window.location.href = url;
      }
    }
  }));
}

function register(dispatch: Function, name: string, email: string, password: string, passwordConfirm: string, profileData: string, callback: any) {
  const ed = errorDispatch(dispatch);

  let user = {
    email: email,
    password: password,
    profile: {
      name: name
    }
  };

  if (!isNotEmpty(ed, email) || !isNotEmpty(ed, password) || !isEmail(ed, email) || !areValidPasswords(ed, password, passwordConfirm)) {
    callback();
    return;
  }

  dispatch(mutation({
    query: `mutation createAccountAndLogin($user: UserPasswordInput!) {
      createAccountAndLogin(user: $user) {
        hashedToken
        expires
        user {
          _id
          profile {
            ${profileData}
          }
          roles
        }
      }
    }`,
    variables: {
      user,
      password
    },
    catchCallback: (error) => {
      let err = error.message;
      if (error.graphQLErrors) {
        err = error.graphQLErrors[0];
      }
      if (err.message.match(/Email not verified!/)) {
        dispatch(actions.showInfo(i18n`Account successfully created! We sent you an email with instructions on how to activate your account.`));
      } else if (err.message.match(/User with this email already exists!/)) {
        ed(i18n`User with this email already exists!`);
      } else if (err.message.match(/Email doesn\'t match the criteria./)) {
        ed(i18n`Email doesn\'t match the criteria`);
      } else if (err.message.match(/Login forbidden/)) {
        ed(i18n`Login forbidden`);
      } else {
        ed(i18n`Unknown error`);
      }
      if (callback) { callback(); }
    },
    thenCallback: (data: any) => {
      dispatch(actions.logIn(data.createAccountAndLogin));
      if (callback) { callback(); }
    }
  }));
}

export default actions;
