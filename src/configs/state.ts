import User from './user_model';
import { trimInput, isEmail, isNotEmpty, isValidPassword, areValidPasswords } from '../configs/helpers';
import i18n from 'es2015-i18n-tag';
import { mutate as apolloMutate } from 'apollo-mantra';
import { observable, action } from 'mobx';

declare global {
  namespace App.Accounts {
    type State = AccountState<User>;

    export interface LoginData {
      expires: number;
      hashedToken: string;
      user: User;
    }
  }
}

export class AccountState<T extends User> {
  @observable view: string;
  @observable error: string;
  @observable info: string;
  @observable token: string;
  @observable user: T;
  @observable userId: string;
  @observable loggingIn: boolean;
  @observable mutating: boolean;
  profileData: string;

  createUser: (userData: User) => T;
  mutate = apolloMutate;

  constructor(createUser?: (userData: User) => T, profileData?: string, initialUser?: T) {
    if (createUser) {
      this.createUser = createUser;
    } else {
      this.createUser = (userData: User) => new User(userData) as any;
    }
    if (initialUser) {
      this.user = initialUser;
      this.userId = initialUser._id;
    }
    this.profileData = profileData;
    this.view = 'signIn';
  }

  isAdmin() {
    return this.user && this.user.roles && this.user.roles.indexOf('admin') >= 0;
  }

  playsRole(role: string) {
    return this.user && this.user.roles && this.user.roles.indexOf(role) >= 0;
  }

  playsRoles(roles: string[]) {
    return this.user && this.user.roles && roles.some(r => this.user.roles.indexOf(r) >= 0);
  }

  @action
  showError = (error: string) => {
    this.error = error;
  };

  @action
  showInfo = (info: string) => {
    this.info = info;
  };

  @action
  logOut = (): any => {
    // remove token from the storage
    if (window && window.localStorage) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('jwtTokenExpiration');
    }
    this.loggingIn = false;
    this.user.logout();
    this.view = 'signIn';
    this.error = '';
    this.info = '';
    this.user = null;
    this.userId = null;
  };

  @action
  logIn = (data: App.Accounts.LoginData): any => {
    if (window && window.localStorage) {
      localStorage.setItem('jwtToken', data.hashedToken);
      localStorage.setItem('jwtTokenExpiration', data.expires.toString());
    }
    this.user = this.createUser(data.user);
    this.userId = data.user._id;
    this.view = 'loggedIn';
    this.loggingIn = false;
    this.user.login(data);
  };

  @action
  changeLoggingIn = (loggingIn: boolean) => {
    this.loggingIn = loggingIn;
  };

  @action
  showSignIn = () => {
    this.view = 'signIn';
    this.error = '';
    this.info = '';
  };

  @action
  showResendVerification = () => {
    this.view = 'resendVerification';
    this.error = '';
    this.info = '';
  };

  @action
  showRegister = () => {
    this.view = 'register';
    this.error = '';
    this.info = '';
  };

  @action
  showForgotPassword = () => {
    this.view = 'forgotPassword';
    this.error = '';
    this.info = '';
  };

  @action
  showResetPassword = (token: string) => {
    this.view = 'resetPassword';
    this.error = '';
    this.info = '';
    this.token = token;
  };

  @action
  clearErrors = () => {
    this.error = '';
    this.info = '';
  };

  @action
  setToken = (token: string) => {
    this.token = token;
  };

  resume(state: App.Accounts.State, token: string, tokenExpiration: number, profileData: string) {
    if (new Date().getTime() > tokenExpiration) {
      state.logOut();
      return;
    }

    state.mutating = true;
    state.changeLoggingIn(true);

    this.mutate({
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
      catchCallback: _error => {
        if (process.env.NODE_ENV === 'production') {
          state.logOut();
        }
      },
      thenCallback: (data: any) => {
        state.logIn(data.resume);
      },
      finalCallback() {
        state.mutating = false;
      }
    });
  }

  signIn(state: App.Accounts.State, email: string, password: string, profileData: string): any {
    email = trimInput(email.toLowerCase());

    if (
      !isNotEmpty(state, email) ||
      !isEmail(state, email) ||
      !isNotEmpty(state, password) ||
      !isValidPassword(state, password)
    ) {
      return;
    }

    state.mutating = true;

    this.mutate({
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
      catchCallback: error => {
        if (error.graphQLErrors) {
          error = error.graphQLErrors[0] as any;
        }

        if (error.message.match(/Email not verified/)) {
          state.showError(i18n`Your email is not verified`);
        } else {
          state.showError(i18n`User or password is invalid`);
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

  resendVerification(state: App.Accounts.State, email: string, callback?: Function) {
    if (!isNotEmpty(state, email) || !isEmail(state, email)) {
      if (callback) {
        callback();
      }
      return;
    }

    state.mutating = true;
    this.mutate({
      query: gql`
        mutation requestResendVerification($email: String!) {
          requestResendVerification(email: $email)
        }
      `,
      variables: {
        email
      },
      catchCallback: err => {
        if (err.message.match(/User not found/) || err.message.match(/User email does not exist/)) {
          state.showError(i18n`User with this email does not exist`);
        } else if (err.message.match(/User already verified/)) {
          state.showError(i18n`This user is already verified`);
        } else {
          console.error(err);
          state.showError(i18n`Server error`);
        }
        if (callback) {
          callback();
        }
      },
      thenCallback: (_data: any) => {
        state.showInfo(i18n`We sent you instructions on how to verify your email`);
        if (callback) {
          callback();
        }
      },
      finalCallback() {
        state.mutating = false;
      }
    });
  }

  emailResetLink(state: App.Accounts.State, email: string, callback?: Function) {
    if (!isNotEmpty(state, email) || !isEmail(state, email)) {
      if (callback) {
        callback();
      }
      return;
    }

    state.mutating = true;
    this.mutate({
      query: gql`
        mutation requestResetPassword($email: String!) {
          requestResetPassword(email: $email)
        }
      `,
      variables: {
        email
      },
      catchCallback: error => {
        if (error.graphQLErrors) {
          error = error.graphQLErrors[0] as any;
        }

        if (error.message.match(/User email does not exist/)) {
          state.showError(i18n`User with this email does not exist!`);
        } else {
          console.error(error);
          state.showError(i18n`Server error`);
        }
        if (callback) {
          callback();
        }
      },
      thenCallback: (_data: any) => {
        state.showInfo(i18n`We sent you an email with password reset instructions`);
        if (callback) {
          callback();
        }
      },
      finalCallback() {
        state.mutating = false;
      }
    });
  }

  resetPassword(
    state: App.Accounts.State,
    token: string,
    password: string,
    passwordConfirm: string,
    profileData: string,
    callback?: Function
  ): void {
    if (!isNotEmpty(state, password) || !areValidPasswords(state, password, passwordConfirm)) {
      return;
    }

    state.mutating = true;
    this.mutate({
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
      catchCallback: error => {
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
        // state.showInfo('accounts.messages.passwordChanged'));
        const url = location.href.split('?')[0];
        if (history && history.pushState) {
          history.pushState(null, '', url);
          state.logIn(data.resetPassword);
        } else {
          state.logIn(data.resetPassword);
          window.location.href = url;
        }
      },
      finalCallback() {
        state.mutating = false;
        if (callback) {
          callback();
        }
      }
    });
  }

  verify(state: App.Accounts.State, token: string, profileData: string): void {
    state.mutating = true;
    this.mutate({
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
      catchCallback: error => {
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
      },
      finalCallback() {
        state.mutating = false;
      }
    });
  }

  register(
    state: App.Accounts.State,
    name: string,
    email: string,
    password: string,
    passwordConfirm: string,
    profileData: string,
    profile: Object = {},
    callback?: any
  ) {
    let user = {
      email: email,
      password: password,
      profile: {
        name: name,
        ...profile
      }
    };

    if (
      !isNotEmpty(state, name) ||
      !isNotEmpty(state, email) ||
      !isNotEmpty(state, password) ||
      !isEmail(state, email) ||
      !areValidPasswords(state, password, passwordConfirm)
    ) {
      if (callback) {
        callback();
      }
      return;
    }

    state.mutating = true;
    this.mutate({
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
      catchCallback: error => {
        if (error.graphQLErrors) {
          error = error.graphQLErrors[0] as any;
        }
        if (error.message.match(/Email not verified!/)) {
          state.showInfo(
            i18n`Account successfully created! We sent you an email with instructions on how to activate your account.`
          );
        } else if (error.message.match(/User with this email already exists!/)) {
          state.showError(i18n`User with this email already exists!`);
        } else if (error.message.match(/Email doesn\'t match the criteria./)) {
          state.showError(i18n`Email doesn\'t match the criteria`);
        } else if (error.message.match(/Login forbidden/)) {
          state.showError(i18n`Login forbidden`);
        } else {
          state.showError(error.message);
        }
        if (callback) {
          callback();
        }
      },
      thenCallback: (data: any) => {
        state.logIn(data.createAccountAndLogin);
        if (callback) {
          callback();
        }
      },
      finalCallback() {
        state.mutating = false;
      }
    });
  }
}

let state: AccountState<User> = null;

export function replaceState<T extends User>(initialState: AccountState<T>) {
  state = initialState;
  return state;
}

export function getAccountState() {
  if (!state) {
    state = new AccountState();
  }
  return state;
}

// negotiate new token on page loading
