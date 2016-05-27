import { useDeps, composeWithTracker, composeAll, IKomposer, IKomposerData } from "mantra-core";
import Component, { IComponentProps, IComponentActions } from "../components/logged_user_view";

interface IProps {
  context?: IContext;
  showUserName?: boolean;
}

export const composer: IKomposer = ({context, showUserName}: IProps, onData: IKomposerData<IComponentProps>) => {
  const { Meteor, i18n }: IContext = context;

  onData(null, {
    userName: showUserName ? Meteor.user().profile.name : "",
    context: context
  });

  return null;
};

export const depsMapper = (context: IContext, actions: any): IComponentActions => ({
  signOut: actions.accounts.signOut,
  context: context
});

export default composeAll<IProps>(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(Component);
