import { trimInput, isEmail, isNotEmpty, isValidPassword, areValidPasswords } from '../configs/helpers';
import i18n from 'es2015-i18n-tag';
import getState from '../configs/state';
import { mutate } from 'apollo-mantra';

export function resume(token: string, tokenExpiration: number, profileData: string) {
  const state = getState();
  if (new Date().getTime() > tokenExpiration) {
    state.logOut();
    return;
  }

  state.changeLoggingIn(true);

  mutate({
    query: gql`mutation resume($token: String!) {
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
      state.changeLoggingIn(false);
      if (window['process'] == null || window['process'].env == null || window['process'].env.NODE_ENV !== 'DEBUG') {
        state.logOut();
      }
    },
    thenCallback: (data: any) => {
      state.changeLoggingIn(false);
      state.logIn(data.resume);
    }
  });
}


export function signIn(email: string, password: string, profileData: string): any {
  const state = getState();
  email = trimInput(email.toLowerCase());

  if (!isNotEmpty(state, email) || !isEmail(state, email) || !isNotEmpty(state, password) || !isValidPassword(state, password)) {
    return;
  }

  state.mutating = true;

  mutate({
    query: gql`mutation loginWithPassword($user: UserPasswordInput!) {
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
      if (error.graphQLErrors) {
        error = error.graphQLErrors[0] as any;
      }

      if (error.message.match(/Email not verified/)) {
        state.showError(i18n`Your email is not verified`);
      } else {
        state.showError(i18n`User of password is invalid`);
      }
    },
    thenCallback: (data: any) => {
      state.logIn(data.loginWithPassword);
    },
    finalCallback() {
      state.mutating = false;
    }
  });
}

export function resendVerification(email: string, callback: Function) {
  const state = getState();
  if (!isNotEmpty(state, email) || !isEmail(state, email)) {
    if (callback) { callback(); }
    return;
  }

  mutate({
    query: gql`mutation requestResendVerification($email: String!) {
      requestResendVerification(email: $email)
    }`,
    variables: {
      email
    },
    catchCallback: (err) => {
      if (err.message.match(/User not found/) || err.message.match(/User email does not exist/)) {
        state.showError(i18n`User with this email does not exist`);
      } else if (err.message.match(/User already verified/)) {
        state.showError(i18n`This user is already verified`);
      } else {
        console.error(err);
        state.showError(i18n`Server error`);
      }
      if (callback) { callback(); }
    },
    thenCallback: (_data: any) => {
      state.showInfo(i18n`We sent you instructions on how to verify your email`);
      if (callback) { callback(); }
    }
  });
}

export function emailResetLink(email: string, callback: Function) {
  const state = getState();
  if (!isNotEmpty(state, email) || !isEmail(state, email)) {
    if (callback) { callback(); }
    return;
  }

  mutate({
    query: gql`mutation requestResetPassword($email: String!) {
      requestResetPassword(email: $email)
    }`,
    variables: {
      email
    },
    catchCallback: (error) => {
      if (error.graphQLErrors) {
        error = error.graphQLErrors[0] as any;
      }

      if (error.message.match(/User email does not exist/)) {
        state.showError(i18n`User with this email does not exist!`);
      } else {
        console.error(error);
        state.showError(i18n`Server error`);
      }
      if (callback) { callback(); }
    },
    thenCallback: (_data: any) => {
      state.showInfo(i18n`We sent you an email with password reset instructions`);
      if (callback) { callback(); }
    }
  });
}

export function resetPassword(token: string, password: string, passwordConfirm: string, profileData: string, callback: Function): void {
  const state = getState();
  if (!isNotEmpty(state, password) || !areValidPasswords(state, password, passwordConfirm)) {
    return;
  }

  mutate({
    query: gql`mutation resetPassword($token: String!, $password: String!) {
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
      if (error.graphQLErrors) {
        error = error.graphQLErrors[0] as any;
      }

      if (error.message.match(/jwt expired/)) {
        state.showError(i18n`Session Expired`);
      } else if (error.message.match(/invalid token/)) {
        state.showError(i18n`Login prohibited with malformed token`);
      } else if (error.message.match('jwt malformed')) {
        state.showError(i18n`Login prohibited with malformed token`);
      } else {
        state.showError(error.message);
      }
      if (callback) { callback(); }
    },
    thenCallback: (data: any) => {
      // state.showInfo('accounts.messages.passwordChanged'));
      const url = location.href.split('?')[0];
      if (history && history.pushState) {
        history.pushState(null, '', url);
        state.logIn(data.resetPassword);
      } else {
        state.logIn(data.resetPassword);
        window.location.href = url;
      }
      if (callback) { callback(); }
    }
  });
}

export function verify(token: string, profileData: string): void {
  const state = getState();
  mutate({
    query: gql`mutation verify($token: String!) {
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
      if (error.graphQLErrors) {
        error = error.graphQLErrors[0] as any;
      }

      if (error.message.match(/jwt expired/)) {
        state.showError(i18n`Session Expired`);
      } else if (error.message.match(/invalid token/)) {
        state.showError(i18n`Login prohibited with malformed token`);
      } else if (error.message.match('jwt malformed')) {
        state.showError(i18n`Login prohibited with malformed token`);
      } else {
        state.showError(error.message);
      }
    },
    thenCallback: (data: any) => {
      const url = location.href.split('?')[0];
      state.logIn(data.verify);

      if (history && history.pushState) {
        history.pushState(null, '', url);
      } else {
        window.location.href = url;
      }
    }
  });
}

export function register(name: string, email: string, password: string, passwordConfirm: string, profileData: string, callback: any) {
  const state = getState();
  let user = {
    email: email,
    password: password,
    profile: {
      name: name
    }
  };

  if (!isNotEmpty(state, email) || !isNotEmpty(state, password) || !isEmail(state, email) || !areValidPasswords(state, password, passwordConfirm)) {
    callback();
    return;
  }

  mutate({
    query: gql`mutation createAccountAndLogin($user: UserPasswordInput!) {
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
      if (error.graphQLErrors) {
        error = error.graphQLErrors[0] as any;
      }
      if (error.message.match(/Email not verified!/)) {
        state.showInfo(i18n`Account successfully created! We sent you an email with instructions on how to activate your account.`);
      } else if (error.message.match(/User with this email already exists!/)) {
        state.showInfo(i18n`User with this email already exists!`);
      } else if (error.message.match(/Email doesn\'t match the criteria./)) {
        state.showInfo(i18n`Email doesn\'t match the criteria`);
      } else if (error.message.match(/Login forbidden/)) {
        state.showInfo(i18n`Login forbidden`);
      } else {
        state.showInfo(i18n`Unknown error`);
      }
      if (callback) { callback(); }
    },
    thenCallback: (data: any) => {
      state.logIn(data.createAccountAndLogin);
      if (callback) { callback(); }
    }
  });
}

