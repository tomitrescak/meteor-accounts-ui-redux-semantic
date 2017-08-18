import { getAccountState, State } from './configs/state';
import { User, RegisterProfile } from './configs/user_model';
 
export { default as AccountsView } from './components/accounts_root_view';
export { default as UserView } from './components/logged_user_view';
export { User, RegisterProfile } from './configs/user_model';
export { getAccountState, State } from './configs/state';

export function initState<T extends User, U extends RegisterProfile>(createUser: (data: any) => T, profileType: U, cache: boolean): State<T, U> {
  const state = getAccountState({
    createUser,
    profileType,
    cache
  });

  state.init();

  return state as any;
}
