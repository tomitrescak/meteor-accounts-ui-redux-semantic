import Component from '../components/accounts_root_view';
import { connect } from 'react-redux';
import context from '../configs/context';
import actions, { config } from '../actions/accounts';
import { mayBeStubbed } from 'react-stubber';

interface IProps {
  context?: AccountsUI.Context;
}

const mapStateToProps = (state: IGlobalState) => ({
  viewType: state.accounts.view,
  alerts: state.accounts.error ? context.__(state.accounts.error) : null,
  infos: state.accounts.info ? context.__(state.accounts.info) : null,
  token: state.accounts.token,
  context
});

const mapDispatchToProps = (dispatch: any, ownProps: any): any => {
  return {
    clearMessages: () =>
      dispatch(actions.clearMessages()),
    emailResetLink: (email: string, callback: AccountsUI.AsyncCallback) =>
      dispatch(actions.emailResetLink(context, email, callback)),
    signIn: (email: string, password: string, callback: AccountsUI.AsyncCallback) =>
      dispatch(actions.signIn(context, email, password, config.profileData, callback)),
    signOut: () =>
      dispatch(actions.logOut()),
    emailVerification: (email: string, callback: AccountsUI.AsyncCallback) =>
      dispatch(actions.resendVerification(context, email, callback)),
    resetPassword: (token: string, password: string, passwordConfirm: string, callback: AccountsUI.AsyncCallback) =>
      dispatch(actions.resetPassword(context, token, password, passwordConfirm, config.profileData, callback)),
    showForgotPassword: () =>
      dispatch(actions.showForgotPassword()),
    showResendVerification:  () =>
      dispatch(actions.showVerification()),
    showRegister:  () =>
      dispatch(actions.showRegister()),
    showSignIn:  () =>
      dispatch(actions.showSignin()),
    register: (name: string, email: string, password: string, passwordConfirmation: string, callback: AccountsUI.AsyncCallback) =>
      dispatch(actions.register(context, name, email, password, passwordConfirmation, config.profileData, callback)),
    context: context
  };
};

export default mayBeStubbed(connect(mapStateToProps, mapDispatchToProps)(Component));
