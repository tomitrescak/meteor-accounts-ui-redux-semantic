import { getAccountState, State } from './configs/state';
import { User } from './configs/user_model';

export { default as AccountsView } from './components/accounts_root_view';
export { default as UserView } from './components/logged_user_view';
export { default as UserModel } from './configs/user_model';
export { getAccountState, State } from './configs/state';

export function initState<T extends User>(userType: any, profileType: any): State<T> {
  const state = getAccountState({
    userType,
    profileType
  });

  state.init();

  return state as any;
}
