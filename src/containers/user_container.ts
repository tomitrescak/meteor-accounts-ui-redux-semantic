import Component, { IComponentProps, IComponentActions } from '../components/logged_user_view';
import { connect } from 'react-redux';
import actions from '../actions/accounts';

export interface IProps {
  showUserName?: boolean;
}

const mapStateToProps = (state: IGlobalState, origProps: IProps): IComponentProps => ({
  userName: origProps.showUserName ? state.accounts.user.profile.name : null,
  userId: state.accounts.userId
});

const mapDispatchToProps = (dispatch: any): IComponentActions => {
  return {
    signOut: () =>
      dispatch(actions.logOut())
  };
};

export default connect<IProps>(mapStateToProps, mapDispatchToProps)(Component);
