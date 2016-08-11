import * as Actions from '../actions/accounts';
import context from './context';

const a = context.__;

declare global {
  interface IGlobalState {
    accounts: IState;
  }

  interface IState {
    view?: string;
    error?: string;
    info?: string;
    token?: string;
    user?: any;
    userId?: string;
    loggingIn?: boolean;
  }

  interface IAction {
    type: string;
  }
}

let localState: any;

function showError(state: IState, error: string, info?: string) {
  return Object.assign({}, state, { error: error, info: info });
}

function clearUser(): any {
  return { user: null, userId: null, view: 'signIn' };
}

function assignUser(state: IState, user: any): any {
  return Object.assign({}, state, { user: user, userId: user._id, view: 'loggedIn' });
}

function changeLoggingIn(state: IState, loggingIn: boolean) {
  return Object.assign({}, state, { loggingIn });
}

function showSignIn(state: IState)  {
  return Object.assign({}, state, { view: 'signIn', error: '', info: '' });
}

function showResendVerification(state: IState)  {
  return Object.assign({}, state, { view: 'resendVerification', error: '', info: '' });
}

function showRegister(state: IState) {
  return Object.assign({}, state, { view: 'register', error: '', info: '' });
}

function showForgotPassword(state: IState) {
  return Object.assign({}, state, { view: 'forgotPassword', error: '', info: '' });
}

function showResetPassword(state: IState, token: string) {
  return Object.assign({}, state, { view: 'resetPassword', error: '', info: '', token: token });
}

function clearErrors(state: IState) {
  return Object.assign({}, state, { error: '', info: '' });
}

function setToken(state: IState, token: string) {
  return Object.assign({}, state, { token });
}

export default function(state: IState = { view: 'signIn', error: '', loggingIn: false }, action: any) {
  switch (action.type) {
    case Actions.CHANGE_LOGGING_IN:
      return changeLoggingIn(state, action.loggingIn);
    case Actions.CLEAR_MESSAGES:
      return clearErrors(state);
    case Actions.SHOW_ERROR:
      return showError(state, action.message);
    case Actions.SHOW_MESSAGE:
        return showError(state, null, action.message);
    case Actions.SHOW_SIGNIN:
      return showSignIn(state);
    case Actions.SHOW_REGISTER:
      return showRegister(state);
    case Actions.SHOW_VERIFICATION:
      return showResendVerification(state);
    case Actions.SHOW_FORGOT:
      return showForgotPassword(state);
    case Actions.ASSIGN_USER:
        return assignUser(state, action.user);
    case Actions.CLEAR_USER:
      return clearUser();
    case Actions.SET_TOKEN:
      return setToken(state, action.token);
  }

  return state;
}
