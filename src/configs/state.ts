import User from './user_model';
import { observable, action } from 'mobx';

declare global {
  namespace App.Accounts {
    export interface State<T extends User> {
      view?: string;
      error?: string;
      info?: string;
      token?: string;
      user?: T;
      userId?: string;
      loggingIn?: boolean;
      mutating?: boolean;
      isAdmin(): boolean;
      playsRole(role: string): boolean;
      playsRoles(roles: string[]): boolean;
    }

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

  @action showError = (error: string) => {
    this.error = error;
  }

  @action showInfo = (info: string) => {
    this.info = info;
  }

  @action logOut = (): any => {
    // remove token from the storage
    if (window && window.localStorage) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('jwtTokenExpiration');
    }
    this.user.logout();
    this.view = 'signIn';
    this.error = '';
    this.info = '';
    this.user = null;
    this.userId = null;
  }

  @action logIn = (data: App.Accounts.LoginData): any => {
    if (window && window.localStorage) {
      localStorage.setItem('jwtToken', data.hashedToken);
      localStorage.setItem('jwtTokenExpiration', data.expires.toString());
    }
    this.user = this.createUser(data.user);
    this.userId = data.user._id;
    this.view = 'loggedIn';

    this.user.login(data);
  }

  @action changeLoggingIn = (loggingIn: boolean) => {
    this.loggingIn = loggingIn;
  }

  @action showSignIn = () => {
    this.view = 'signIn';
    this.error = '';
    this.info = '';
  }

  @action showResendVerification = () => {
    this.view = 'resendVerification';
    this.error = '';
    this.info = '';
  }

  @action showRegister = () => {
    this.view = 'register';
    this.error = '';
    this.info = '';
  }

  @action showForgotPassword = () => {
    this.view = 'forgotPassword';
    this.error = '';
    this.info = '';
  }

  @action showResetPassword = (token: string) => {
    this.view = 'resetPassword';
    this.error = '';
    this.info = '';
    this.token = token;
  }

  @action clearErrors = () => {
    this.error = '';
    this.info = '';
  }

  @action setToken = (token: string) => {
    this.token = token;
  }
}

let state: AccountState<User> = null;

export function replaceState<T extends User>(initialState: AccountState<T>) {
  state = initialState;
  return state;
}

export default function() { return state; };


// negotiate new token on page loading
