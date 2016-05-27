import { useDeps, composeWithTracker, composeAll } from "mantra-core";
import Component from "../components/logged_user_view";
export const composer = ({ context, showUserName }, onData) => {
    const { Meteor, i18n } = context;
    onData(null, {
        userName: showUserName ? Meteor.user().profile.name : "",
        context: context
    });
    return null;
};
export const depsMapper = (context, actions) => ({
    signOut: actions.accounts.signOut,
    context: context
});
export default composeAll(composeWithTracker(composer), useDeps(depsMapper))(Component);
