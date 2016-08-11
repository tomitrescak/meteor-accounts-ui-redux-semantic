import { useDeps, composeWithTracker, composeAll, IKomposer, IKomposerData } from "mantra-core";
import Component, { IComponentProps, IComponentActions } from "../components/logged_user_view";
import { connect } from "react-redux";
import context from "../configs/context";
import actions from "../actions/accounts";

interface IProps {
  context?: IAccountsUiContext;
  showUserName?: boolean;
}

const mapStateToProps = (state: IGlobalState, origProps: IProps) => ({
  userName: origProps.showUserName ? state.accounts.user.profile.name : null,
  userId: state.accounts.userId,
  context: context
});

const mapDispatchToProps = (dispatch: any, ownProps: any): any => {
  context.dispatch = dispatch;
  return {
    signOut: () =>
      dispatch(actions.signOut(context))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
