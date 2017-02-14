import getState, { AccountState, replaceState } from './configs/state';
import User from './configs/user_model';
import * as actions from './actions/accounts';

export { default as AccountsView } from './components/accounts_root_view';
export { default as UserView } from './components/logged_user_view';
export { default as UserModel } from './configs/user_model';
export { default as AccountsState, AccountState } from './configs/state';

function getParameterByName(name: string) {
  let match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function resume(verifyToken: string, profileData: string) {
  const state = getState();
  if (window && window.localStorage) {
    // verify
    if (verifyToken) {
      actions.verify(verifyToken, profileData);
      return;
    }

    // resume
    const token = localStorage.getItem('jwtToken');
    const expiration = parseInt(localStorage.getItem('jwtTokenExpiration'), 10);

    if (token && token !== 'null') {
      state.token = token;
      actions.resume(token, expiration, profileData);
    }
  } else {
    setTimeout(resume, 100);
  }
}

export function initState<T extends User>(state?: any): AccountState<T> {
  if (state) {
    replaceState(state);
  }
  // setup current view
  let defaultView = 'signIn';
  const initialToken = getParameterByName('resetPassword');
  if (initialToken) {
    state.token = initialToken;
    defaultView = 'resetPassword';
  }
  const verifyToken = getParameterByName('verifyEmail');
  state.view = defaultView;

  // resume in next click
  setTimeout(() => resume(verifyToken, state.profileData), 1);

  return state as any;
}
