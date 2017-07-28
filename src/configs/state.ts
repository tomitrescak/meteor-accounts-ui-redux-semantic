import { User, UserModel, Profile, ProfileModel } from './user_model';
import { trimInput, isEmail, isNotEmpty, isValidPassword, areValidPasswords } from '../configs/helpers';
import i18n from 'es2015-i18n-tag';
import { mutate as apolloMutate } from 'apollo-mantra';
import { observable, action, IObservableArray } from 'mobx';
import { types, IModelType, IType, ISnapshottable, unprotect } from 'mobx-state-tree';
import * as Form from 'semantic-ui-mobx';

declare global {
  namespace App.Accounts {
    interface StateBase {
      error: string;
      info: string;
      mutating: boolean;
      profileData: string;
      token: string;
      userId: string;
      view: string;
      loginEmail: Form.Field<string>,
      loginPassword: Form.Field<string>,
      registerPassword1: Form.Field<string>,
      registerPassword2: Form.Field<string>,
      registerName: Form.Field<string>,
      profile: any,
      coldStart(verifyToken: string, profileData: string): void;
      emailResetLink(email: string, callback?: Function): void;
      init(): void;
      logOut(): void;
      resendVerification(email: string, callback?: Function): void;
      setView(view: string): void;
      showForgotPassword(): void;
      showRegister(): void;
      showResendVerification(): void;
      showSignIn(): void;
      signIn(email: string, password: string, profileData: string): void;
      register(
        _state: any,
        name: string,
        email: string,
        password: string,
        passwordConfirm: string,
        profileData: string,
        profile: Object,
        callback?: any
      ): void;
      resetPassword(
        token: string,
        password: string,
        passwordConfirm: string,
        profileData: string,
        callback?: Function
      ): void;
      resume(token: string, tokenExpiration: number, profileData: string): void;
      verify(token: string, profileData: string): void;
    }

    interface State<T extends User> extends StateBase {
      user: T;
    }

    export interface LoginData {
      expires: number;
      hashedToken: string;
      user: User;
    }
  }
}

let mutation = apolloMutate;

// import { IMutation } from 'apollo-mantra';

function getParameterByName(name: string) {
  if (typeof window === 'undefined') {
    return null;
  }
  let match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

export function createState<T extends User>(userModel: IModelType<User, User>, profileModel: IModelType<Profile, Profile>): App.Accounts.State<T> {
  const AccountState = types.model(
    'AccountState',
    {
      loginEmail: Form.requiredField(''),
      loginPassword: Form.requiredField(''),
      registerPassword1: Form.requiredField(''),
      registerPassword2: Form.requiredField(''),
      registerName: Form.requiredField(''),
      registerProfile: types.optional(profileModel, {}),
      view: 'signIn',
      error: '',
      info: '',
      token: '',
      userId: '',
      user: types.optional(userModel, { emails: [], roles: [] }),
      loggingIn: false,
      mutating: false,
      profileData: ''
    },
    {
      mutate: apolloMutate,
      setView(view: string) {
        this.view = view;
      },
      showError(error: string) {
        this.error = error;
      },

      showInfo(info: string) {
        this.info = info;
      },

      init() {
        // setup current view
        let defaultView = 'signIn';
        const initialToken = getParameterByName('resetPassword');
        if (initialToken) {
          this.token = initialToken;
          defaultView = 'resetPassword';
        }
        const verifyToken = getParameterByName('verifyEmail');
        this.view = defaultView;

        // resume in next click
        setTimeout(() => this.coldStart(verifyToken, this.profileData), 1);
      },

      logOut(): any {
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
      },

      logIn(data: App.Accounts.LoginData): any {
        if (window && window.localStorage) {
          localStorage.setItem('jwtToken', data.hashedToken);
          localStorage.setItem('jwtTokenExpiration', data.expires.toString());
        }
        this.user = data.user;
        this.userId = data.user._id;
        this.view = 'loggedIn';
        this.loggingIn = false;
        this.user.login(data);
      },

      changeLoggingIn(loggingIn: boolean) {
        this.loggingIn = loggingIn;
      },

      showSignIn() {
        this.view = 'signIn';
        this.error = '';
        this.info = '';
      },

      showResendVerification() {
        this.view = 'resendVerification';
        this.error = '';
        this.info = '';
      },

      showRegister() {
        this.view = 'register';
        this.error = '';
        this.info = '';
      },
      showForgotPassword() {
        this.view = 'forgotPassword';
        this.error = '';
        this.info = '';
      },

      showResetPassword(token: string) {
        this.view = 'resetPassword';
        this.error = '';
        this.info = '';
        this.token = token;
      },

      clearErrors() {
        this.error = '';
        this.info = '';
      },

      setToken(token: string) {
        this.token = token;
      },

      coldStart(verifyToken: string, profileData: string) {
        if (typeof window === 'undefined') {
          return;
        }

        if (window.localStorage) {
          // verify
          if (verifyToken) {
            this.verify(verifyToken, profileData);
            return;
          }

          // resume
          const token = localStorage.getItem('jwtToken');
          const expiration = parseInt(localStorage.getItem('jwtTokenExpiration'), 10);

          if (token && token !== 'null') {
            this.token = token;
            this.resume(token, expiration, profileData);
          }
        } else {
          setTimeout(this.coldStart, 100);
        }
      },

      resume(token: string, tokenExpiration: number, profileData: string) {
        if (new Date().getTime() > tokenExpiration) {
          this.logOut();
          return;
        }

        this.mutating = true;
        this.changeLoggingIn(true);

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
              this.logOut();
            }
          },
          thenCallback: (data: any) => {
            this.logIn(data.resume);
          },
          finalCallback: () => {
            this.mutating = false;
          }
        });
      },

      signIn(email: string, password: string, profileData: string): any {
        email = trimInput(email.toLowerCase());

        if (
          !isNotEmpty(this, email) ||
          !isEmail(this, email) ||
          !isNotEmpty(this, password) ||
          !isValidPassword(this, password)
        ) {
          return;
        }

        this.mutating = true;

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
              this.showError(i18n`Your email is not verified`);
            } else {
              this.showError(i18n`User or password is invalid`);
            }
          },
          thenCallback: (data: any) => {
            this.logIn(data.loginWithPassword);
          },
          finalCallback: () => {
            this.mutating = false;
          }
        });
      },

      resendVerification(email: string, callback?: Function) {
        if (!isNotEmpty(this, email) || !isEmail(this, email)) {
          if (callback) {
            callback();
          }
          return;
        }

        this.mutating = true;
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
              this.showError(i18n`User with this email does not exist`);
            } else if (err.message.match(/User already verified/)) {
              this.showError(i18n`This user is already verified`);
            } else {
              console.error(err);
              this.showError(i18n`Server error`);
            }
            if (callback) {
              callback();
            }
          },
          thenCallback: (_data: any) => {
            this.showInfo(i18n`We sent you instructions on how to verify your email`);
            if (callback) {
              callback();
            }
          },
          finalCallback: () => {
            this.mutating = false;
          }
        });
      },

      emailResetLink(email: string, callback?: Function) {
        if (!isNotEmpty(this, email) || !isEmail(this, email)) {
          if (callback) {
            callback();
          }
          return;
        }

        this.mutating = true;
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
              this.showError(i18n`User with this email does not exist!`);
            } else {
              console.error(error);
              this.showError(i18n`Server error`);
            }
            if (callback) {
              callback();
            }
          },
          thenCallback: (_data: any) => {
            this.showInfo(i18n`We sent you an email with password reset instructions`);
            if (callback) {
              callback();
            }
          },
          finalCallback: () => {
            this.mutating = false;
          }
        });
      },

      resetPassword(
        token: string,
        password: string,
        passwordConfirm: string,
        profileData: string,
        callback?: Function
      ): void {
        if (!isNotEmpty(this, password) || !areValidPasswords(this, password, passwordConfirm)) {
          return;
        }

        this.mutating = true;
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
              this.showError(i18n`Session Expired`);
            } else if (error.message.match(/invalid token/)) {
              this.showError(i18n`Login prohibited with malformed token`);
            } else if (error.message.match('jwt malformed')) {
              this.showError(i18n`Login prohibited with malformed token`);
            } else {
              this.showError(error.message);
            }
          },
          thenCallback: (data: any) => {
            // this.showInfo('accounts.messages.passwordChanged'));
            const url = location.href.split('?')[0];
            if (history && history.pushState) {
              history.pushState(null, '', url);
              this.logIn(data.resetPassword);
            } else {
              this.logIn(data.resetPassword);
              window.location.href = url;
            }
          },
          finalCallback: () => {
            this.mutating = false;
            if (callback) {
              callback();
            }
          }
        });
      },

      verify(token: string, profileData: string): void {
        this.mutating = true;
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
              this.showError(i18n`Session Expired`);
            } else if (error.message.match(/invalid token/)) {
              this.showError(i18n`Login prohibited with malformed token`);
            } else if (error.message.match('jwt malformed')) {
              this.showError(i18n`Login prohibited with malformed token`);
            } else {
              this.showError(error.message);
            }
          },
          thenCallback: (data: any) => {
            const url = location.href.split('?')[0];
            this.logIn(data.verify);

            if (history && history.pushState) {
              history.pushState(null, '', url);
            } else {
              window.location.href = url;
            }
          },
          finalCallback: () => {
            this.mutating = false;
          }
        });
      },

      register(
        _state: any,
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
          !isNotEmpty(this, name) ||
          !isNotEmpty(this, email) ||
          !isNotEmpty(this, password) ||
          !isEmail(this, email) ||
          !areValidPasswords(this, password, passwordConfirm)
        ) {
          if (callback) {
            callback();
          }
          return;
        }

        this.mutating = true;
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
              this.showInfo(
                i18n`Account successfully created! We sent you an email with instructions on how to activate your account.`
              );
            } else if (error.message.match(/User with this email already exists!/)) {
              this.showError(i18n`User with this email already exists!`);
            } else if (error.message.match(/Email doesn\'t match the criteria./)) {
              this.showError(i18n`Email doesn\'t match the criteria`);
            } else if (error.message.match(/Login forbidden/)) {
              this.showError(i18n`Login forbidden`);
            } else {
              this.showError(error.message);
            }
            if (callback) {
              callback();
            }
          },
          thenCallback: (data: any) => {
            this.logIn(data.createAccountAndLogin);
            if (callback) {
              callback();
            }
          },
          finalCallback: () => {
            this.mutating = false;
          }
        });
      }
    }
  );

  return AccountState.create() as any;
}

let state: any;

export function getAccountState<T extends User>({ userType = UserModel, profileType = ProfileModel, cache = true } = {}): App.Accounts.State<T> {
  if (!cache || !state) {
    state = createState(userType as any, profileType as any);
  }
  return state;
  // return createState(userType as any);
}

// negotiate new token on page loading
// const r = types.compose('c', UserModel, { other: 10 }, { foo() { return 70; } });
// interface Q extends User {
//   foo(): number;
// }
// const g = getAccountState<Q>(r);
// unprotect(g);
// g.loginEmail..user.profile.name = 'ty';
// console.log(g.user.profile.name);

