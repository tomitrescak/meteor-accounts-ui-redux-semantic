import AccountsContainer from './containers/accounts_container';
import UserContainer from './containers/user_container';
import accountReducer from './configs/reducer';

export const AccountsView = AccountsContainer;
export const UserView = UserContainer;
export const reducer = accountReducer;
