import Component from "../components/accounts_root_view";
import { connect } from "react-redux";
import context from "../configs/context";
import actions from "../actions/accounts";
const mapStateToProps = (state) => ({
    viewType: state.accounts.view,
    alerts: state.accounts.error ? context.__(state.accounts.error) : null,
    infos: state.accounts.info ? context.__(state.accounts.info) : null,
    token: state.accounts.token,
    context
});
const mapDispatchToProps = (dispatch, ownProps) => {
    context.dispatch = dispatch;
    return {
        clearMessages: () => dispatch(actions.clearMessages()),
        emailResetLink: (email, callback) => dispatch(actions.emailResetLink(context, email, callback)),
        signIn: (email, password, callback) => dispatch(actions.signIn(context, email, password, callback)),
        signOut: () => dispatch(actions.signOut(context)),
        emailVerification: (email, callback) => dispatch(actions.resendVerification(context, email, callback)),
        resetPassword: (token, password, passwordConfirm, callback) => dispatch(actions.resetPassword(context, token, password, passwordConfirm, callback)),
        showForgotPassword: () => dispatch(actions.showForgotPassword()),
        showResendVerification: () => dispatch(actions.showVerification()),
        showRegister: () => dispatch(actions.showRegister()),
        showSignIn: () => dispatch(actions.showSignin()),
        register: (name, email, password, passwordConfirmation, callback) => dispatch(actions.register(context, name, email, password, passwordConfirmation, callback)),
        context: context
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Component);
