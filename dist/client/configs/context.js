import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Accounts } from "meteor/accounts-base";
import { __, i18n } from "i18n-client";
import methodStubs from "./method_stubs/accounts";
import accountsConfig from "./accounts_config";
import i18nConfig from "./i18n";
import actions from "../actions/accounts";
import { Roles } from "meteor/alanning:roles";
let context = {
    i18n,
    __,
    Meteor,
    Accounts,
    dispatch: null
};
// init package
methodStubs(context);
accountsConfig();
i18nConfig(context);
function dispatch(func) {
    if (context.dispatch) {
        context.dispatch(func);
    }
    else {
        setTimeout(() => dispatch(func), 50);
    }
}
const extensions = (id) => {
    return {
        isRole(role) {
            return Roles.userIsInRole(id, role);
        },
        isAdmin() {
            return Roles.userIsInRole(id, "admin");
        }
    };
};
// init tracker which will monitor the user and dispatch actions when necessary
let muser = null;
let mloggingIn = false;
Tracker.autorun(() => {
    let user = Meteor.user();
    let loggingIn = Meteor.loggingIn();
    if (loggingIn !== mloggingIn) {
        dispatch(actions.changeLoggingIn(loggingIn));
        mloggingIn = loggingIn;
    }
    if (user) {
        if (!muser) {
            // add role extensions
            user = Object.assign(user, extensions(user._id));
            // add this user to the store
            dispatch(actions.assignUser(user));
        }
    }
    else {
        if (muser) {
            dispatch(actions.clearUser());
        }
    }
    ;
    muser = user;
});
export default context;
