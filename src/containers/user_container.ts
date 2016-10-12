import Component, { IComponentProps, IComponentActions } from '../components/logged_user_view';
import { connect } from 'react-redux';
import context from '../configs/context';
import actions from '../actions/accounts';
import { mayBeStubbed } from 'react-stubber';

interface IProps {
  context?: AccountsUI.Context;
  showUserName?: boolean;
}

const mapStateToProps = (state: IGlobalState, origProps: IProps): IComponentProps => ({
  userName: origProps.showUserName ? state.accounts.user.profile.name : null,
  userId: state.accounts.userId,
  context: context
});

const mapDispatchToProps = (dispatch: any, ownProps: any): IComponentActions => {
  return {
    signOut: () =>
      dispatch(actions.logOut())
  };
};

export default mayBeStubbed(connect(mapStateToProps, mapDispatchToProps)(Component));
