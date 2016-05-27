import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Accounts } from "meteor/accounts-base";
import { __, i18n } from "i18n-client";
import methodStubs from "./method_stubs/accounts";
import accountsConfig from "./accounts_config";
import i18nConfig from "./i18n";
import actions from "../actions/accounts";
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
// init tracker which will monitor the user and dispatch actions when necessary
let muser = null;
Tracker.autorun(() => {
    const user = Meteor.user();
    if (user) {
        if (!muser) {
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
