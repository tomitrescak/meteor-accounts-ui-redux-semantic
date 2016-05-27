import React, { Component } from "react";
export default class SignIn extends Component {
    signIn() {
        if ($("#signIn").hasClass("loading")) {
            return;
        }
        $("#signInForm").form("validate form");
        if (!$("#signInForm").form("is valid")) {
            return;
        }
        $("#signIn").addClass("loading");
        const email = this.refs["email"]["value"];
        const password = this.refs["password"]["value"];
        this.props.signIn(email, password, () => {
            $("#signIn").removeClass("loading");
        });
    }
    render() {
        const mf = this.props.context.i18n.initTranslator("accounts");
        return (React.createElement("div", {className: "ui form"}, 
            React.createElement("div", {className: "field"}, 
                React.createElement("label", null, mf("email")), 
                React.createElement("div", {className: "ui icon input"}, 
                    React.createElement("input", {type: "text", placeholder: mf("emailAddress"), id: "email", ref: "email"}), 
                    React.createElement("i", {className: "main icon"}))), 
            React.createElement("div", {className: "field"}, 
                React.createElement("label", null, mf("password")), 
                React.createElement("div", {className: "ui icon input"}, 
                    React.createElement("input", {type: "password", placeholder: mf("password"), id: "password", ref: "password"}), 
                    React.createElement("i", {className: "lock icon"}))), 
            React.createElement("div", {className: "ui equal width center aligned grid", style: { marginTop: 5 }}, 
                React.createElement("div", {className: "left aligned column", style: { paddingTop: 2 }}, 
                    React.createElement("div", null, 
                        React.createElement("a", {href: "#", id: "forgotPasswordButton", onClick: this.props.showForgotPassword}, mf("forgotPassword"))
                    )
                ), 
                React.createElement("div", {className: "centered aligned"}, 
                    React.createElement("div", {className: "ui submit primary button", onClick: this.signIn.bind(this), id: "signIn"}, mf("signIn"))
                ), 
                React.createElement("div", {className: "right aligned column", style: { paddingTop: 2 }}, 
                    React.createElement("div", null, 
                        React.createElement("a", {href: "#", onClick: this.props.showResendVerification}, mf("resendVerification"))
                    )
                ), 
                React.createElement("div", {className: "ui horizontal divider"}, "Or"), 
                React.createElement("div", {className: "column", style: { paddingTop: 2 }}, 
                    React.createElement("div", {className: "green ui labeled icon button", onClick: this.props.showRegister}, 
                        React.createElement("i", {className: "signup icon"}), 
                        mf("signUp"))
                ))));
    }
    componentDidMount() {
        // this.props.clearMessages();
        const mf = this.props.context.i18n.initTranslator("accounts");
        $(".ui.form")
            .form({
            inline: true,
            on: "blur",
            fields: {
                username: {
                    identifier: "email",
                    rules: [{
                            type: "empty",
                            prompt: mf("error.emailRequired")
                        }, {
                            type: "email",
                            prompt: mf("error.emailRequired")
                        }]
                },
                password: {
                    identifier: "password",
                    rules: [{
                            type: "empty",
                            prompt: mf("error.passwordRequired")
                        }, {
                            type: "length[7]",
                            prompt: mf("error.minChar")
                        }]
                }
            }
        });
    }
}
