// import User from './user_model';
// import { trimInput, isEmail, isNotEmpty, isValidPassword, areValidPasswords } from '../configs/helpers';
// import i18n from 'es2015-i18n-tag';
// import { mutate as apolloMutate } from 'apollo-mantra';
// import { observable, action } from 'mobx';
// import { types, IModelType } from 'mobx-state-tree';

// declare global {
//   namespace App.Accounts {
//     type MobxState = typeof AccountState.Type;

//     export interface LoginData {
//       expires: number;
//       hashedToken: string;
//       user: User;
//     }
//   }
// }

// let u: any;

// import { IMutation } from 'apollo-mantra';

// export const AccountState = types.model(
//   'AccountState',
//   {
//     view: 'signIn',
//     error: '',
//     info: '',
//     token: '',
//     userId: '',
//     loggingIn: false,
//     mutating: false,
//     profileData: ''
//   },
//   {
//     get user() { return u; },
//     set user(value: any) { u = value },
//     mutate: apolloMutate,
//     isAdmin() {
//       return this.user && this.user.roles && this.user.roles.indexOf('admin') >= 0;
//     },

//     playsRole(role: string) {
//       return this.user && this.user.roles && this.user.roles.indexOf(role) >= 0;
//     },

//     playsRoles(roles: string[]) {
//       return this.user && this.user.roles && roles.some(r => this.user.roles.indexOf(r) >= 0);
//     },

//     showError(error: string) {
//       this.error = error;
//     },

//     showInfo(info: string) {
//       this.info = info;
//     },

//     logOut(): any {
//       // remove token from the storage
//       if (window && window.localStorage) {
//         localStorage.removeItem('jwtToken');
//         localStorage.removeItem('jwtTokenExpiration');
//       }
//       this.loggingIn = false;
//       this.user.logout();
//       this.view = 'signIn';
//       this.error = '';
//       this.info = '';
//       this.user = null;
//       this.userId = null;
//     },

//     logIn(data: App.Accounts.LoginData, user: any): any {
//       if (window && window.localStorage) {
//         localStorage.setItem('jwtToken', data.hashedToken);
//         localStorage.setItem('jwtTokenExpiration', data.expires.toString());
//       }
//       this.user = this.createUser(data.user);
//       this.userId = data.user._id;
//       this.view = 'loggedIn';
//       this.loggingIn = false;
//       this.user.login(data);
//     },

//     changeLoggingIn(loggingIn: boolean) {
//       this.loggingIn = loggingIn;
//     },

//     showSignIn() {
//       this.view = 'signIn';
//       this.error = '';
//       this.info = '';
//     },

//     showResendVerification() {
//       this.view = 'resendVerification';
//       this.error = '';
//       this.info = '';
//     },

//     showRegister() {
//       this.view = 'register';
//       this.error = '';
//       this.info = '';
//     },
//     showForgotPassword() {
//       this.view = 'forgotPassword';
//       this.error = '';
//       this.info = '';
//     },

//     showResetPassword(token: string) {
//       this.view = 'resetPassword';
//       this.error = '';
//       this.info = '';
//       this.token = token;
//     },

//     clearErrors() {
//       this.error = '';
//       this.info = '';
//     },

//     setToken(token: string) {
//       this.token = token;
//     },

//     resume(_state: any, token: string, tokenExpiration: number, profileData: string) {
//       if (new Date().getTime() > tokenExpiration) {
//         this.logOut();
//         return;
//       }

//       this.mutating = true;
//       this.changeLoggingIn(true);

//       this.mutate({
//         query: gql`mutation resume($token: String!) {
//       resume(token: $token) {
//         hashedToken
//         expires
//         user {
//           _id
//           profile {
//             ${profileData}
//           }
//           roles
//         }
//       }
//     }`,
//         variables: {
//           token
//         },
//         catchCallback: _error => {
//           if (process.env.NODE_ENV === 'production') {
//             this.logOut();
//           }
//         },
//         thenCallback: (data: any) => {
//           this.logIn(data.resume);
//         },
//         finalCallback: () => {
//           this.mutating = false;
//         }
//       });
//     },

//     signIn(_state: any, email: string, password: string, profileData: string): any {
//       email = trimInput(email.toLowerCase());

//       if (
//         !isNotEmpty(this, email) ||
//         !isEmail(this, email) ||
//         !isNotEmpty(this, password) ||
//         !isValidPassword(this, password)
//       ) {
//         return;
//       }

//       this.mutating = true;

//       this.mutate({
//         query: gql`mutation loginWithPassword($user: UserPasswordInput!) {
//       loginWithPassword(user: $user) {
//         hashedToken
//         expires
//         user {
//           _id
//           profile {
//             ${profileData}
//           }
//           roles
//         }
//       }
//     }`,
//         variables: {
//           user: {
//             email,
//             password
//           }
//         },
//         catchCallback: error => {
//           if (error.graphQLErrors) {
//             error = error.graphQLErrors[0] as any;
//           }

//           if (error.message.match(/Email not verified/)) {
//             this.showError(i18n`Your email is not verified`);
//           } else {
//             this.showError(i18n`User or password is invalid`);
//           }
//         },
//         thenCallback: (data: any) => {
//           this.logIn(data.loginWithPassword);
//         },
//         finalCallback: () => {
//           this.mutating = false;
//         }
//       });
//     },

//     resendVerification(_state: any, email: string, callback?: Function) {
//       if (!isNotEmpty(this, email) || !isEmail(this, email)) {
//         if (callback) {
//           callback();
//         }
//         return;
//       }

//       this.mutating = true;
//       this.mutate({
//         query: gql`
//           mutation requestResendVerification($email: String!) {
//             requestResendVerification(email: $email)
//           }
//         `,
//         variables: {
//           email
//         },
//         catchCallback: err => {
//           if (err.message.match(/User not found/) || err.message.match(/User email does not exist/)) {
//             this.showError(i18n`User with this email does not exist`);
//           } else if (err.message.match(/User already verified/)) {
//             this.showError(i18n`This user is already verified`);
//           } else {
//             console.error(err);
//             this.showError(i18n`Server error`);
//           }
//           if (callback) {
//             callback();
//           }
//         },
//         thenCallback: (_data: any) => {
//           this.showInfo(i18n`We sent you instructions on how to verify your email`);
//           if (callback) {
//             callback();
//           }
//         },
//         finalCallback: () => {
//           this.mutating = false;
//         }
//       });
//     },

//     emailResetLink(_state: any, email: string, callback?: Function) {
//       if (!isNotEmpty(this, email) || !isEmail(this, email)) {
//         if (callback) {
//           callback();
//         }
//         return;
//       }

//       this.mutating = true;
//       this.mutate({
//         query: gql`
//           mutation requestResetPassword($email: String!) {
//             requestResetPassword(email: $email)
//           }
//         `,
//         variables: {
//           email
//         },
//         catchCallback: error => {
//           if (error.graphQLErrors) {
//             error = error.graphQLErrors[0] as any;
//           }

//           if (error.message.match(/User email does not exist/)) {
//             this.showError(i18n`User with this email does not exist!`);
//           } else {
//             console.error(error);
//             this.showError(i18n`Server error`);
//           }
//           if (callback) {
//             callback();
//           }
//         },
//         thenCallback: (_data: any) => {
//           this.showInfo(i18n`We sent you an email with password reset instructions`);
//           if (callback) {
//             callback();
//           }
//         },
//         finalCallback: () => {
//           this.mutating = false;
//         }
//       });
//     },

//     resetPassword(
//       _state: any,
//       token: string,
//       password: string,
//       passwordConfirm: string,
//       profileData: string,
//       callback?: Function
//     ): void {
//       if (!isNotEmpty(this, password) || !areValidPasswords(this, password, passwordConfirm)) {
//         return;
//       }

//       this.mutating = true;
//       this.mutate({
//         query: gql`mutation resetPassword($token: String!, $password: String!) {
//       resetPassword(token: $token, password: $password) {
//         hashedToken
//         expires
//         user {
//           _id
//           profile {
//             ${profileData}
//           }
//           roles
//         }
//       }
//     }`,
//         variables: {
//           token,
//           password
//         },
//         catchCallback: error => {
//           if (error.graphQLErrors) {
//             error = error.graphQLErrors[0] as any;
//           }

//           if (error.message.match(/jwt expired/)) {
//             this.showError(i18n`Session Expired`);
//           } else if (error.message.match(/invalid token/)) {
//             this.showError(i18n`Login prohibited with malformed token`);
//           } else if (error.message.match('jwt malformed')) {
//             this.showError(i18n`Login prohibited with malformed token`);
//           } else {
//             this.showError(error.message);
//           }
//         },
//         thenCallback: (data: any) => {
//           // this.showInfo('accounts.messages.passwordChanged'));
//           const url = location.href.split('?')[0];
//           if (history && history.pushState) {
//             history.pushState(null, '', url);
//             this.logIn(data.resetPassword);
//           } else {
//             this.logIn(data.resetPassword);
//             window.location.href = url;
//           }
//         },
//         finalCallback: () => {
//           this.mutating = false;
//           if (callback) {
//             callback();
//           }
//         }
//       });
//     },

//     verify(_state: any, token: string, profileData: string): void {
//       this.mutating = true;
//       this.mutate({
//         query: gql`mutation verify($token: String!) {
//       verify(token: $token) {
//         hashedToken
//         expires
//         user {
//           _id
//           profile {
//             ${profileData}
//           }
//           roles
//         }
//       }
//     }`,
//         variables: {
//           token
//         },
//         catchCallback: error => {
//           if (error.graphQLErrors) {
//             error = error.graphQLErrors[0] as any;
//           }

//           if (error.message.match(/jwt expired/)) {
//             this.showError(i18n`Session Expired`);
//           } else if (error.message.match(/invalid token/)) {
//             this.showError(i18n`Login prohibited with malformed token`);
//           } else if (error.message.match('jwt malformed')) {
//             this.showError(i18n`Login prohibited with malformed token`);
//           } else {
//             this.showError(error.message);
//           }
//         },
//         thenCallback: (data: any) => {
//           const url = location.href.split('?')[0];
//           this.logIn(data.verify);

//           if (history && history.pushState) {
//             history.pushState(null, '', url);
//           } else {
//             window.location.href = url;
//           }
//         },
//         finalCallback: () => {
//           this.mutating = false;
//         }
//       });
//     },

//     register(
//       _state: any,
//       name: string,
//       email: string,
//       password: string,
//       passwordConfirm: string,
//       profileData: string,
//       profile: Object = {},
//       callback?: any
//     ) {
//       let user = {
//         email: email,
//         password: password,
//         profile: {
//           name: name,
//           ...profile
//         }
//       };

//       if (
//         !isNotEmpty(this, name) ||
//         !isNotEmpty(this, email) ||
//         !isNotEmpty(this, password) ||
//         !isEmail(this, email) ||
//         !areValidPasswords(this, password, passwordConfirm)
//       ) {
//         if (callback) {
//           callback();
//         }
//         return;
//       }

//       this.mutating = true;
//       this.mutate({
//         query: gql`mutation createAccountAndLogin($user: UserPasswordInput!) {
//       createAccountAndLogin(user: $user) {
//         hashedToken
//         expires
//         user {
//           _id
//           profile {
//             ${profileData}
//           }
//           roles
//         }
//       }
//     }`,
//         variables: {
//           user,
//           password
//         },
//         catchCallback: error => {
//           if (error.graphQLErrors) {
//             error = error.graphQLErrors[0] as any;
//           }
//           if (error.message.match(/Email not verified!/)) {
//             this.showInfo(
//               i18n`Account successfully created! We sent you an email with instructions on how to activate your account.`
//             );
//           } else if (error.message.match(/User with this email already exists!/)) {
//             this.showError(i18n`User with this email already exists!`);
//           } else if (error.message.match(/Email doesn\'t match the criteria./)) {
//             this.showError(i18n`Email doesn\'t match the criteria`);
//           } else if (error.message.match(/Login forbidden/)) {
//             this.showError(i18n`Login forbidden`);
//           } else {
//             this.showError(error.message);
//           }
//           if (callback) {
//             callback();
//           }
//         },
//         thenCallback: (data: any) => {
//           this.logIn(data.createAccountAndLogin);
//           if (callback) {
//             callback();
//           }
//         },
//         finalCallback: () => {
//           this.mutating = false;
//         }
//       });
//     }
//   }
// );

// // let state: AccountState<User> = null;

// export function replaceState<T extends User>(initialState: AccountState<T>) {
//   state = initialState;
//   return state;
// }

// export function getAccountState() {
//   if (!state) {
//     state = new AccountState();
//   }
//   return state;
// }

// // negotiate new token on page loading
