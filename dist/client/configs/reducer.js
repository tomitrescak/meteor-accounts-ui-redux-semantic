import * as Actions from "../actions/accounts";
let localState;
function showError(state, error, info) {
    return Object.assign({}, state, { error: error, info: info });
}
function clearUser() {
    return { user: null, view: "signIn" };
}
function assignUser(state, user) {
    return Object.assign({}, state, { user: user, view: "loggedIn" });
}
function showSignIn(state) {
    return Object.assign({}, state, { view: "signIn", error: "", info: "" });
}
function showResendVerification(state) {
    return Object.assign({}, state, { view: "resendVerification", error: "", info: "" });
}
function showRegister(state) {
    return Object.assign({}, state, { view: "register", error: "", info: "" });
}
function showForgotPassword(state) {
    return Object.assign({}, state, { view: "forgotPassword", error: "", info: "" });
}
function showResetPassword(state, token) {
    return Object.assign({}, state, { view: "resetPassword", error: "", info: "", token: token });
}
function clearErrors(state) {
    return Object.assign({}, state, { error: "", info: "" });
}
function setToken(state, token) {
    return Object.assign({}, state, { token });
}
export default function (state = { view: "signIn", error: "" }, action) {
    switch (action.type) {
        case Actions.CLEAR_MESSAGES:
            return clearErrors(state);
        case Actions.SHOW_ERROR:
            return showError(state, action.message);
        case Actions.SHOW_MESSAGE:
            return showError(state, null, action.message);
        case Actions.SHOW_SIGNIN:
            return showSignIn(state);
        case Actions.SHOW_REGISTER:
            return showRegister(state);
        case Actions.SHOW_VERIFICATION:
            return showResendVerification(state);
        case Actions.SHOW_FORGOT:
            return showForgotPassword(state);
        case Actions.ASSIGN_USER:
            return assignUser(state, action.user);
        case Actions.CLEAR_USER:
            return clearUser();
        case Actions.SET_TOKEN:
            return setToken(state, action.token);
    }
    return state;
}
