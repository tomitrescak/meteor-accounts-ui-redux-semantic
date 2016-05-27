var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import React, { Component } from "react";
import SignIn from "./sign_in_view";
import ForgotPassword from "./forgot_password_view";
import ResendVerification from "./resend_verification_view";
import ResetPassword from "./reset_password_view";
import Register from "./sign_up_view";
import LogOutView from "./log_out_view";
export default class AccountsRoot extends Component {
    render() {
        this.context = this.props.context;
        // const { error } = this.props;
        return (React.createElement("div", null, 
            this.props.alerts ? React.createElement("div", {className: "ui red message"}, this.props.alerts) : "", 
            this.props.infos ? React.createElement("div", {className: "ui green message"}, this.props.infos) : "", 
            this.props.viewType === "forgotPassword" ? React.createElement(ForgotPassword, __assign({}, this.props)) : "", 
            this.props.viewType === "resendVerification" ? React.createElement(ResendVerification, __assign({}, this.props)) : "", 
            this.props.viewType === "resetPassword" ? React.createElement(ResetPassword, __assign({}, this.props)) : "", 
            this.props.viewType === "signIn" ? React.createElement(SignIn, __assign({}, this.props)) : "", 
            this.props.viewType === "register" ? React.createElement(Register, __assign({}, this.props)) : "", 
            this.props.viewType === "loggedIn" ? React.createElement(LogOutView, __assign({}, this.props)) : ""));
    }
}
