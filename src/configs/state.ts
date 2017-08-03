import * as Form from 'semantic-ui-mobx';
// tslint:disable-next-line:no-unused-variable
import { types, IModelType, ISnapshottable, IType } from 'mobx-state-tree';
// tslint:disable-next-line:no-unused-variable
import { IObservableArray } from 'mobx';

import i18n from 'es2015-i18n-tag';
import { mutate as apolloMutate } from 'apollo-mantra';
import { Snapshot } from 'mobx-state-tree/dist/types/complex-types/object';
import { UserModel, RegisterProfile, RegisterProfileModel, User } from './user_model';
import { trimInput, isEmail, isNotEmpty, isValidPassword, areValidPasswords } from '../configs/helpers';

export interface StateBase {
  apolloError: string;
  error: string;
  info: string;
  mutating: boolean;
  profileData: string;
  token: string;
  user: User;
  userId: string;
  view: string;
  loggingIn: boolean;
  loginEmail: Form.Field<string>;
  loginPassword: Form.Field<string>;
  registerPassword1: Form.Field<string>;
  registerPassword2: Form.Field<string>;
  registerName: Form.Field<string>;
  profile: any;
  registerProfile: any;
  coldStart(verifyToken: string, profileData: string): void;
  emailResetLink(email: string, callback?: Function): void;
  init(): void;
  logIn(): void;
  logOut(): void;
  mutate(): void;
  resendVerification(email: string, callback?: Function): void;
  setProfileData(profileData: string): void;
  setView(view: string): void;
  setToken(token: string): void;
  setUser(user: Snapshot<User>): void;
  setUserId(id: string): void;
  showError(message: string): void;
  showInfo(message: string): void;
  showForgotPassword(): void;
  showRegister(): void;
  showResendVerification(): void;
  showSignIn(): void;
  signIn(email: string, password: string, profileData: string): void;
  register(
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

export interface State<T extends User> extends StateBase {
  user: T;
}

export interface LoginData {
  expires: number;
  hashedToken: string;
  user: User;
}

// import { IMutation } from 'apollo-mantra';

export function createState<T extends User>(
  userModel: IModelType<typeof UserModel.SnapshotType, User>,
  profileModel: IModelType<typeof RegisterProfileModel.SnapshotType, RegisterProfile>
): State<T> {
  const AccountState = types.model(
    'AccountState',
    {
      loginEmail: Form.requiredField('', [Form.emailValidator]),
      loginPassword: Form.requiredField(''),
      registerPassword1: Form.requiredField('', [
        Form.lengthValidator(7, i18n`Password needs to have at least 7 characters`)
      ]),
      registerPassword2: Form.requiredField('', [
        Form.lengthValidator(7, i18n`Password needs to have at least 7 characters`)
      ]),
      registerName: Form.requiredField(''),
      registerProfile: types.optional(profileModel, {}),
      view: 'signIn',
      error: '',
      apolloError: '',
      info: '',
      token: '',
      userId: types.maybe(types.string),
      user: types.maybe(userModel),
      loggingIn: false,
      mutating: false,
      profileData: ''
    },
    {
      mutate: apolloMutate,
      setView(view: string) {
        this.view = view;
      },
      setProfileData(profileData: string) {
        this.profileData = profileData;
      },
      setMutating(mutating: boolean) {
        this.mutating = mutating;
      },
      setUserId(id: string) {
        this.userId = id;
      },
      setUser(user: User) {
        this.user = user;
      },
      showError(error: string, apolloError?: string) {
        this.error = error;
        this.apolloError = apolloError;
      },

      showInfo(info: string) {
        this.info = info;
      },
      getParameterByName(name: string) {
        // if (typeof window === 'undefined') {
        //   return null;
        // }
        let match = RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
      },
      init() {
        // setup current view
        let defaultView = 'signIn';
        const initialToken = this.getParameterByName('resetPassword');
        if (initialToken) {
          this.token = initialToken;
          defaultView = 'resetPassword';
        }
        const verifyToken = this.getParameterByName('verifyEmail');
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
        this.user.logout();
        this.loggingIn = false;
        this.view = 'signIn';
        this.error = '';
        this.info = '';
        this.user = null;
        this.userId = null;
      },

      logIn(data: LoginData): any {
        if (window && window.localStorage) {
          localStorage.setItem('jwtToken', data.hashedToken);
          localStorage.setItem('jwtTokenExpiration', data.expires.toString());
        }

        this.view = 'loggedIn';
        this.user = data.user;
        this.userId = data.user._id;

        this.user.login(data);
        this.changeLoggingIn(false);

        // reset component
        this.loginPassword.value = '';
        this.registerName.value = '';
        this.registerPassword1.value = '';
        this.registerPassword2.value = '';
        this.registerProfile = {} as any;
      },

      changeLoggingIn(loggingIn: boolean) {
        this.loggingIn = loggingIn;
      },

      showSignIn() {
        this.view = 'signIn';
        this.clearErrors();
      },

      showResendVerification() {
        this.view = 'resendVerification';
        this.clearErrors();
      },
      showRegister() {
        this.view = 'register';
        this.clearErrors();
      },
      showForgotPassword() {
        this.view = 'forgotPassword';
        this.clearErrors();
      },
      // showResetPassword(token: string) {
      //   this.view = 'resetPassword';
      //   this.clearErrors();
      //   this.token = token;
      // },
      clearErrors() {
        this.error = '';
        this.info = '';
      },

      setToken(token: string) {
        this.token = token;
      },

      coldStart(verifyToken: string, profileData: string) {
        // if (typeof window === 'undefined') {
        //   return;
        // }

        if (localStorage) {
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
          // setTimeout(this.coldStart, 100);
          this.showError(i18n`You cannot log in in private mode. Please turn it off and try again.`)
        }
      },

      resume(token: string, tokenExpiration: number, profileData: string) {
        if (new Date().getTime() > tokenExpiration) {
          this.logOut();
          return;
        }

        this.mutating = true;
        this.changeLoggingIn(true);

        return this.mutate({
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
            this.setMutating(false);
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

        return this.mutate({
          query: gql`
            mutation loginWithPassword($user: UserPasswordInput!) {
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
              this.showError(i18n`Your email is not verified`, error.message);
            } else {
              this.showError(i18n`User or password is invalid`, error.message);
            }
          },
          thenCallback: (data: any) => {
            // console.log(data);
            this.logIn(data.loginWithPassword);
          },
          finalCallback: () => {
            this.setMutating(false);
          }
        });
      },

      resendVerification(email: string) {
        if (!isNotEmpty(this, email) || !isEmail(this, email)) {
          return;
        }

        this.mutating = true;
        return this.mutate({
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
              // console.error(err);
              this.showError(i18n`Server error`);
            }
          },
          thenCallback: (_data: any) => {
            this.showInfo(i18n`We sent you instructions on how to verify your email`);
          },
          finalCallback: () => {
            this.setMutating(false);
          }
        });
      },

      emailResetLink(email: string) {
        if (!isNotEmpty(this, email) || !isEmail(this, email)) {
          return;
        }

        this.mutating = true;
        return this.mutate({
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
              // console.error(error);
              this.showError(i18n`Server error`);
            }
          },
          thenCallback: (_data: any) => {
            this.showInfo(i18n`We sent you an email with password reset instructions`);
          },
          finalCallback: () => {
            this.setMutating(false);
          }
        });
      },

      resetPassword(token: string, password: string, passwordConfirm: string, profileData: string) {
        if (!isNotEmpty(this, password) || !areValidPasswords(this, password, passwordConfirm)) {
          return;
        }

        this.mutating = true;
        return this.mutate({
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
            this.logIn(data.resetPassword);

            const url = location.href.split('?')[0];

            if (history && history.pushState) {
              history.pushState(null, '', url);
            } else {
              location.href = url;
            }
          },
          finalCallback: () => {
            this.setMutating(false);
          }
        });
      },

      verify(token: string, profileData: string) {
        this.mutating = true;
        return this.mutate({
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
              location.href = url;
            }
          },
          finalCallback: () => {
            this.setMutating(false);
          }
        });
      },

      register(
        name: string,
        email: string,
        password: string,
        passwordConfirm: string,
        profileData: string,
        profile: Object = {}
      ) {
        let user = {
          email: email,
          password: password,
          profile: {
            name: name,
            ...profile
          }
        };
        this.error = '';
        if (
          !isNotEmpty(this, name) ||
          !isNotEmpty(this, email) ||
          !isNotEmpty(this, password) ||
          !isEmail(this, email) ||
          !areValidPasswords(this, password, passwordConfirm)
        ) {
          return;
        }

        this.mutating = true;
        return this.mutate({
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
            // console.log(error.message);

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
          },
          thenCallback: (data: any) => {
            this.logIn(data.createAccountAndLogin);
          },
          finalCallback: () => {
            this.setMutating(false);
          }
        });
      }
    }
  );

  return AccountState.create({ user: null, userId: null }) as any;
}

let state: any;

export function getAccountState<T extends User>(
  { userType = UserModel as any, profileType = types.optional(RegisterProfileModel, {}) as any, cache = true } = {}
): State<T> {
  if (!cache || !state) {
    state = createState(userType, profileType);
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
