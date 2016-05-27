import React, { Component } from "react";
export default class ForgotPassword extends Component {
    emailResetLink() {
        if ($("#emailButton").hasClass("loading")) {
            return;
        }
        $("#forgotPasswordForm").form("validate form");
        if (!$("#forgotPasswordForm").form("is valid")) {
            return;
        }
        $("#emailButton").addClass("loading");
        const email = this.refs["email"]["value"];
        this.props.emailResetLink(email, () => {
            $("#emailButton").removeClass("loading");
        });
    }
    render() {
        const mf = this.props.context.i18n.initTranslator("accounts");
        return (React.createElement("div", {id: "forgotPasswordForm", className: "ui login form"}, 
            React.createElement("div", {className: "field"}, 
                React.createElement("label", null, mf("email")), 
                React.createElement("div", {className: "ui icon input"}, 
                    React.createElement("input", {type: "text", placeholder: mf("emailAddress"), id: "email", ref: "email"}), 
                    React.createElement("i", {className: "mail icon"}))), 
            React.createElement("div", {className: "ui equal width center aligned grid"}, 
                React.createElement("div", {className: "first column"}, 
                    React.createElement("div", {className: "primary submit icon labeled ui button", id: "emailButton", onClick: this.emailResetLink.bind(this)}, 
                        React.createElement("i", {className: "icon mail"}), 
                        mf("emailResetLink"))
                ), 
                React.createElement("div", {className: "ui horizontal divider"}, "Or"), 
                React.createElement("div", {className: "last column"}, 
                    React.createElement("div", {className: "green ui labeled icon button", id: "signInButton", onClick: this.props.showSignIn.bind(this)}, 
                        React.createElement("i", {className: "sign in icon"}), 
                        mf("signIn"))
                ))));
    }
    componentDidMount() {
        this.props.clearMessages();
        const mf = this.props.context.i18n.initTranslator("accounts");
        $(".ui.form")
            .form({
            inline: true,
            fields: {
                username: {
                    identifier: "email",
                    rules: [
                        {
                            type: "empty",
                            prompt: mf("error.emailRequired")
                        },
                        {
                            type: "email",
                            prompt: mf("error.emailRequired")
                        }
                    ]
                },
            }
        });
    }
}
