import { trimInput, isEmail, isNotEmpty, isValidPassword, areValidPasswords } from '../configs/helpers';

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
  signIn(_: AccountsUI.Context, email: string, password: string, profileData: string, callback: Function) {
    return function(dispatch: Function) {
      signIn(dispatch, email, password, profileData, callback);
    };
  },
  resendVerification(_: AccountsUI.Context, email: string, callback: Function) {
    return function(dispatch: Function) {
      resendVerification(dispatch, email, callback);
    };
  },
  emailResetLink(_: AccountsUI.Context, email: string, callback: Function) {
    return function(dispatch: Function) {
      emailResetLink(dispatch, email, callback);
    };
  },
  resetPassword(_: AccountsUI.Context, passwordResetToken: string, password: string, passwordConfirm: string, profileData: string, callback: AccountsUI.AsyncCallback) {
    return function(dispatch: Function) {
      resetPassword(dispatch, passwordResetToken, password, passwordConfirm, profileData, callback);
    };
  },
  register(_: AccountsUI.Context, name: string, email: string, password: string, passwordConfirm: string, profileData: string, callback: AccountsUI.AsyncCallback) {
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
    catchCallback: (error) => {
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

  if (!isNotEmpty(ed, email) || !isEmail(ed, email) || !isNotEmpty(ed, password) || !isValidPassword(ed, password)) {
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

      if (err.message === 'Email not verified') {
        dispatch(actions.showError('accounts.error.emailNotVerified'));
      } else {
        dispatch(actions.showError('accounts.error.invalidCredentials'));
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
    errorCallback: (err) => {
      if (err.message === 'User not found') {
        dispatch(actions.showError('accounts.error.emailNotFound'));
      } if (err.message === 'User already verified') {
        dispatch(actions.showError('accounts.error.userAlreadyVerified'));
      } else {
        dispatch(actions.showError('accounts.error.unknownError'));
      }
      if (callback) { callback(); }
    },
    thenCallback: (data: any) => {
      dispatch(actions.showInfo('accounts.messages.verificationEmailSent'));
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

      if (err.message === 'User email does not exist') {
        dispatch(actions.showError('accounts.error.emailNotFound'));
      } else {
        dispatch(actions.showError('accounts.error.unknownError'));
      }
      if (callback) { callback(); }
    },
    thenCallback: (data: any) => {
      dispatch(actions.showInfo('accounts.messages.passwordResetEmailSent'));
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

      if (err.message === 'jwt expired') {
        ed('accounts.error.tokenExpired');
      } else if (err.message === 'invalid token') {
        ed('accounts.error.invalidToken');
      } else if (err.message === 'jwt malformed') {
        ed('accounts.error.invalidToken');
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

      if (err.message === 'jwt expired') {
        ed('accounts.error.tokenExpired');
      } else if (err.message === 'invalid token') {
        ed('accounts.error.invalidToken');
      } else if (err.message === 'jwt malformed') {
        ed('accounts.error.invalidToken');
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
      if (err.message === 'User with this email already exists!') {
        ed('accounts.error.emailAlreadyExists');
      } else if (err.message === 'Email doesn\'t match the criteria.') {
        ed('accounts.error.emailLimited');
      } else if (err.message === 'Login forbidden') {
        ed('accounts.error.loginForbidden');
      } else {
        ed('accounts.error.unknownError');
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
