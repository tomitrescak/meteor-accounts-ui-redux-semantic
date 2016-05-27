import { Accounts } from "meteor/accounts-base";
import context from "./context";
import actions from "../actions/accounts";
function dispatch(func) {
    if (context.dispatch) {
        context.dispatch(func);
    }
    else {
        setTimeout(() => dispatch(func), 50);
    }
}
export default function () {
    // configure accounts
    delete Accounts["_accountsCallbacks"]["reset-password"];
    Accounts.onResetPasswordLink((token, done) => {
        dispatch(actions.setToken(token));
    });
    delete Accounts["_accountsCallbacks"]["verify-email"];
    Accounts.onEmailVerificationLink((token, done) => {
        Accounts.verifyEmail(token, function (err) {
            if (err != null) {
                if (err.message = "Verify email link expired [403]") {
                    dispatch(actions.showError("accounts.error.loginTokenExpired"));
                }
            }
            else {
                dispatch(actions.showInfo("accounts.messages.emailVerified"));
                done();
            }
        });
    });
}
