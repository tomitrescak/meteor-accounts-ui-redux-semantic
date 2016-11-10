import Component from '../components/accounts_root_view';
import { connect } from 'react-redux';
import actions, { config } from '../actions/accounts';

interface IProps {
}

const mapStateToProps = (state: IGlobalState) => ({
  viewType: state.accounts.view,
  alerts: state.accounts.error,
  infos: state.accounts.info ,
  token: state.accounts.token
});

const mapDispatchToProps = (dispatch: any, _ownProps: any): any => {
  return {
    clearMessages: () =>
      dispatch(actions.clearMessages()),
    emailResetLink: (email: string, callback: Function) =>
      dispatch(actions.emailResetLink(email, callback)),
    signIn: (email: string, password: string, callback: Function) =>
      dispatch(actions.signIn(email, password, config.profileData, callback)),
    signOut: () =>
      dispatch(actions.logOut()),
    emailVerification: (email: string, callback: Function) =>
      dispatch(actions.resendVerification(email, callback)),
    resetPassword: (token: string, password: string, passwordConfirm: string, callback: Function) =>
      dispatch(actions.resetPassword(token, password, passwordConfirm, config.profileData, callback)),
    showForgotPassword: () =>
      dispatch(actions.showForgotPassword()),
    showResendVerification:  () =>
      dispatch(actions.showVerification()),
    showRegister:  () =>
      dispatch(actions.showRegister()),
    showSignIn:  () =>
      dispatch(actions.showSignin()),
    showError: (message: string) =>
      dispatch(actions.showError(message)),
    register: (name: string, email: string, password: string, passwordConfirmation: string, callback: Function) =>
      dispatch(actions.register(name, email, password, passwordConfirmation, config.profileData, callback))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
