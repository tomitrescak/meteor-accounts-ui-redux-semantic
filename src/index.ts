import { createState, getAccountState } from './configs/state';
import { User } from './configs/user_model';
import { IType } from 'mobx-state-tree';

export { default as AccountsView } from './components/accounts_root_view';
export { default as UserView } from './components/logged_user_view';
export { default as UserModel } from './configs/user_model';
export { getAccountState } from './configs/state';

export function initState<T extends User>(userModel: any): App.Accounts.State<T> {
  const state = getAccountState(userModel);

  state.init();

  return state as any;
}
