import i18n from 'es2015-i18n-tag';
import { mutate as apolloMutate } from 'apollo-mantra';
import { RegisterProfile, User } from './user_model';
import { trimInput, isEmail, isNotEmpty, isValidPassword, areValidPasswords } from '../configs/helpers';
import { observable, action } from 'mobx';
import { FormState, requiredField, emailValidator, lengthValidator } from 'semantic-ui-mobx';

export interface LoginData {
  expires: number;
  hashedToken: string;
  user: User;
}

// import { IMutation } from 'apollo-mantra';

export class State<T extends User, U extends RegisterProfile> extends FormState {
  @requiredField(emailValidator) loginEmail = '';
  @requiredField(lengthValidator(7, 'Password needs to have at least 7 characters')) loginPassword = '';
  @requiredField(lengthValidator(7, 'Password needs to have at least 7 characters')) registerPassword1 = '';
  @requiredField(lengthValidator(7, 'Password needs to have at least 7 characters')) registerPassword2 = '';
  @requiredField registerName = '';
  registerProfile: U;
  @observable view = 'signIn';
  @observable error = '';
  @observable apolloError = '';
  @observable info = '';
  @observable token = '';
  @observable userId: string = null;
  @observable user: T = null;
  @observable loggingIn = false;
  @observable mutating = false;
  @observable profileData = '';

  createUser: (data: any) => T;
  mutate = apolloMutate;
  // changeField(key: string, value: any) {
  //   this[key] = value;
  // },

  constructor(createUser: (data: any) => T, registerProfile: U) {
    super();
    this.createUser = createUser;
    this.registerProfile = registerProfile;
  }

  @action setView(view: string) {
    this.view = view;
  }
  @action setProfileData(profileData: string) {
    this.profileData = profileData;
  }
  @action setMutating(mutating: boolean) {
    this.mutating = mutating;
  }
  @action setUserId(id: string) {
    this.userId = id;
  }
  @action setUser(user: T) {
    this.user = user;
  }
  @action showError(error: string, apolloError?: string) {
    this.error = error;
    this.apolloError = apolloError;
  }
  @action setProfile(profile: any) {
    this.user.profile = profile;
  }
  @action showInfo(info: string) {
    this.info = info;
  }
  getParameterByName(name: string) {
    // if (typeof window === 'undefined') {
    //   return null;
    // }
    let match = RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
  @action init() {
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
  }

  @action logOut = () => {
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
    this.setUser(null);
    this.userId = null;
  }

  @action logIn = (data: LoginData) => {
    if (window && window.localStorage) {
      localStorage.setItem('jwtToken', data.hashedToken);
      localStorage.setItem('jwtTokenExpiration', data.expires.toString());
    }

    this.view = 'loggedIn';
    this.setUser(this.createUser(data.user));
    this.userId = data.user._id;

    this.user.login(data);
    this.changeLoggingIn(false);

    // reset component
    this.loginPassword = '';
    this.registerName = '';
    this.registerPassword1 = '';
    this.registerPassword2 = '';
    this.registerProfile.clear();
  }

  @action changeLoggingIn(loggingIn: boolean) {
    this.loggingIn = loggingIn;
  }

  @action showSignIn = () => {
    this.view = 'signIn';
    this.clearErrors();
  }

  @action showResendVerification = () => {
    this.view = 'resendVerification';
    this.clearErrors();
  }

  @action showRegister = () => {
    this.view = 'register';
    this.clearErrors();
  }

  @action showForgotPassword = () => {
    this.view = 'forgotPassword';
    this.clearErrors();
  }
  // showResetPassword(token: string) {
  //   this.view = 'resetPassword';
  //   this.clearErrors();
  //   this.token = token;
  // },
  @action clearErrors() {
    this.error = '';
    this.info = '';
  }

  @action setToken(token: string) {
    this.token = token;
  }

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
      this.showError(i18n`You cannot log in in private mode. Please turn it off and try again.`);
    }
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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

// // const ComposedState1 = Form.createFormState1('Accounts', { mimo: 1, bar: '' }, { foo() { }});
// const g = ComposedState.create();
// // g.mimo = 1;
// g.changeField('mimo', 13);
// console.log(g.mimo);
// return AccountState.create({ user: null, userId: null }) as any;

let state: any;

export function getAccountState<T extends User, U extends RegisterProfile>(
  { createUser = (data: any) => new User(data) as T, profileType = new RegisterProfile() as U, cache = true } = {}
): State<T, U> {
  if (!cache || !state) {
    state = new State<T, U>(createUser, profileType);
  }
  return state;
  // return createState(userType as any);
}

