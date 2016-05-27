import React, { Component } from "react";
export default class ResetPassword extends Component {
    resetPassword() {
        if ($("#resetPassword").hasClass("loading")) {
            return;
        }
        $("#resetPasswordForm").form("validate form");
        if (!$("#resetPasswordForm").form("is valid")) {
            return;
        }
        $("#resetPassword").addClass("loading");
        const pass1 = this.refs["password"]["value"];
        const pass2 = this.refs["password-again"]["value"];
        this.props.resetPassword(this.props.token, pass1, pass2, () => {
            $("#resetPassword").removeClass("loading");
        });
    }
    render() {
        this.context = this.props.context;
        const mf = this.props.context.i18n.initTranslator("accounts");
        return (React.createElement("div", {className: "ui form login", id: "resetPasswordForm"}, 
            React.createElement("div", {className: "field"}, 
                React.createElement("label", null, mf("password")), 
                React.createElement("div", {className: "ui icon input"}, 
                    React.createElement("input", {type: "password", placeholder: mf("password"), ref: "password", id: "password"}), 
                    React.createElement("i", {className: "lock icon"}))), 
            React.createElement("div", {className: "field"}, 
                React.createElement("label", null, mf("passwordAgain")), 
                React.createElement("div", {className: "ui icon input"}, 
                    React.createElement("input", {type: "password", placeholder: mf("passwordAgain"), ref: "password-again", id: "password-again"}), 
                    React.createElement("i", {className: "lock icon"}))), 
            React.createElement("div", {className: "ui equal width center aligned grid"}, 
                React.createElement("div", {className: "first column"}, 
                    React.createElement("div", {className: "ui red submit button", id: "resetPassword", onClick: this.resetPassword.bind(this)}, mf("resetYourPassword"))
                ), 
                React.createElement("div", {className: "ui horizontal divider"}, "Or"), 
                React.createElement("div", {className: "center aligned column"}, 
                    React.createElement("div", {className: "green ui labeled icon button", onClick: this.props.showSignIn}, 
                        React.createElement("i", {className: "sign in icon"}), 
                        mf("signIn"))
                ))));
    }
    componentDidMount() {
        const mf = this.context.i18n.initTranslator("accounts");
        this.props.clearMessages();
        $(".ui.form")
            .form({
            inline: true,
            fields: {
                password: {
                    identifier: "password",
                    rules: [
                        {
                            type: "empty",
                            prompt: mf("error.passwordRequired")
                        },
                        {
                            type: "length[7]",
                            prompt: mf("error.minChar7")
                        }
                    ]
                },
                passwordConfirm: {
                    identifier: "password-again",
                    rules: [
                        {
                            type: "match[password]",
                            prompt: mf("error.pwdsDontMatch")
                        }
                    ]
                }
            }
        });
    }
}
