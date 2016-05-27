// Write your package code here!

import AccountsContainer from './dist/client/containers/accounts_container';
import UserContainer from './dist/client/containers/user_container';
import accountReducer from './dist/client/configs/reducer';

export const AccountsView = AccountsContainer;
export const UserView = UserContainer;
export const reducer = accountReducer;

// Variables exported by this module can be imported by other packages and
// applications. See accountsui-semanticui-react-tests.js for an example of importing.
export const name = 'accountsui-semanticui-react';
