import * as actions from '../actions/accounts';
import User from './user_model';

// detect default view and find tokens in url

function getParameterByName(name: string) {
    let match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

let defaultView = 'signIn';
const initialToken = getParameterByName('resetPassword');
if (initialToken) {
  defaultView = 'resetPassword';
}
const verifyToken = getParameterByName('verifyEmail');


interface ObjectConstructor {
  assign(object: any, ...params: any[]): Object;
}

export interface IState<T> {
  view?: string;
  error?: string;
  info?: string;
  token?: string;
  user?: T;
  userId?: string;
  loggingIn?: boolean;
}

interface IAction {
  type: string;
}

declare global {
  export interface IGlobalState {
    accounts: IState<User>;
  }
}

function showError(state: IState<User>, error: string, info?: string) {
  return Object.assign({}, state, { error: error, info: info });
}

function logOut(): any {
  // remove token from the storage
  if (window && window.localStorage) {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwtTokenExpiration');
  }
  return { user: null, userId: null, view: 'signIn' };
}

function logIn(state: IState<User>, data: any): any {
  if (window && window.localStorage) {
    localStorage.setItem('jwtToken', data.hashedToken);
    localStorage.setItem('jwtTokenExpiration', data.expires);
  }
  return Object.assign({}, state, { user: new User(data.user), userId: data.user._id, view: 'loggedIn' });
}

function changeLoggingIn(state: IState<User>, loggingIn: boolean) {
  return Object.assign({}, state, { loggingIn });
}

function showSignIn(state: IState<User>) {
  return Object.assign({}, state, { view: 'signIn', error: '', info: '' });
}

function showResendVerification(state: IState<User>) {
  return Object.assign({}, state, { view: 'resendVerification', error: '', info: '' });
}

function showRegister(state: IState<User>) {
  return Object.assign({}, state, { view: 'register', error: '', info: '' });
}

function showForgotPassword(state: IState<User>) {
  return Object.assign({}, state, { view: 'forgotPassword', error: '', info: '' });
}

function showResetPassword(state: IState<User>, token: string) {
  return Object.assign({}, state, { view: 'resetPassword', error: '', info: '', token: token });
}

function clearErrors(state: IState<User>) {
  return Object.assign({}, state, { error: '', info: '' });
}

function setToken(state: IState<User>, token: string) {
  return Object.assign({}, state, { token });
}

export default function initReducer(context: any, profileData: string) {

  function resume() {
    if (context != null && context() && context().Store && window && window.localStorage) {

      const dispatch = context().Store.dispatch;

      // setup profile data
      actions.config.profileData = profileData;

      // verify

      if (verifyToken) {
        dispatch(actions.default.verify(verifyToken, profileData));
        return;
      }

      // resume

      const token = localStorage.getItem('jwtToken');
      const expiration = parseInt(localStorage.getItem('jwtTokenExpiration'), 10);

      if (token && token !== 'null') {
        dispatch(actions.default.resume(token, expiration, profileData));
      }
    } else {
      setTimeout(resume, 100);
    }
  }
  setTimeout(resume, 1);

  return (state: IState<User> = { view: defaultView, error: '', loggingIn: false, token: initialToken }, action: any) => {
    switch (action.type) {
      case actions.LOGOUT:
        return logOut();
      case actions.LOGIN:
        return logIn(state, action.data);
      case actions.CHANGE_LOGGING_IN:
        return changeLoggingIn(state, action.loggingIn);
      case actions.CLEAR_MESSAGES:
        return clearErrors(state);
      case actions.SHOW_ERROR:
        return showError(state, action.message);
      case actions.SHOW_MESSAGE:
        return showError(state, null, action.message);
      case actions.SHOW_SIGNIN:
        return showSignIn(state);
      case actions.SHOW_REGISTER:
        return showRegister(state);
      case actions.SHOW_VERIFICATION:
        return showResendVerification(state);
      case actions.SHOW_FORGOT:
        return showForgotPassword(state);
      case actions.SHOW_RESET_PASSWORD:
        return showResetPassword(state, action.token);
      case actions.SET_TOKEN:
        return setToken(state, action.token);
    }

    return state;
  };
}

// negotiate new token on page loading
