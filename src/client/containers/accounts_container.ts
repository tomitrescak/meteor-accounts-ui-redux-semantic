import { useDeps, composeWithTracker, composeAll, IKomposer, IKomposerData } from "mantra-core";
import Component, { IComponentProps, IComponentActions } from "../components/accounts_root_view";
import { connect } from "react-redux";
import context from "../configs/context";
import actions from "../actions/accounts";

interface IProps {
  context?: IContext;
}

const mapStateToProps = (state: IGlobalState) => ({
  viewType: state.accounts.view,
  alerts: state.accounts.error ? context.__(state.accounts.error) : null,
  infos: state.accounts.info ? context.__(state.accounts.info) : null,
  token: state.accounts.token,
  context
});

const mapDispatchToProps = (dispatch: any, ownProps: any): any => {
  context.dispatch = dispatch;
  return {
    clearMessages: () =>
      dispatch(actions.clearMessages()),
    emailResetLink: (email: string, callback: IAsyncCallback) =>
      dispatch(actions.emailResetLink(context, email, callback)),
    signIn: (email: string, password: string, callback: IAsyncCallback) =>
      dispatch(actions.signIn(context, email, password, callback)),
    signOut: () =>
      dispatch(actions.signOut(context)),
    emailVerification: (email: string, callback: IAsyncCallback) =>
      dispatch(actions.resendVerification(context, email, callback)),
    resetPassword: (token: string, password: string, passwordConfirm: string, callback: IAsyncCallback) =>
      dispatch(actions.resetPassword(context, token, password, passwordConfirm, callback)),
    showForgotPassword: () =>
      dispatch(actions.showForgotPassword()),
    showResendVerification:  () =>
      dispatch(actions.showVerification()),
    showRegister:  () =>
      dispatch(actions.showRegister()),
    showSignIn:  () =>
      dispatch(actions.showSignin()),
    register: (name: string, email: string, password: string, passwordConfirmation: string, callback: IAsyncCallback) =>
      dispatch(actions.register(context, name, email, password, passwordConfirmation, callback)),
    context: context
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
