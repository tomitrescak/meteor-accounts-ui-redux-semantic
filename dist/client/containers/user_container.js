import Component from "../components/logged_user_view";
import { connect } from "react-redux";
import context from "../configs/context";
import actions from "../actions/accounts";
const mapStateToProps = (state, origProps) => ({
    userName: origProps.showUserName ? state.accounts.user.profile.name : null,
    context: context
});
const mapDispatchToProps = (dispatch, ownProps) => {
    context.dispatch = dispatch;
    return {
        signOut: () => dispatch(actions.signOut(context))
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Component);
