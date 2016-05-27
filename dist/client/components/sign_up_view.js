import React, { Component } from "react";
export default class SignUp extends Component {
    register() {
        if ($("#registerButton").hasClass("loading")) {
            return;
        }
        $("#signUpForm").form("validate form");
        if (!$("#signUpForm").form("is valid")) {
            return;
        }
        const name = this.refs["email"]["value"];
        const email = this.refs["email"]["value"];
        const pass1 = this.refs["password"]["value"];
        const pass2 = this.refs["password-again"]["value"];
        $("#registerButton").addClass("loading");
        this.props.register(name, email, pass1, pass2, () => {
            $("#registerButton").removeClass("loading");
        });
    }
    render() {
        const mf = this.props.context.i18n.initTranslator("accounts");
        return (React.createElement("div", {className: "ui form login", id: "signUpForm"}, 
            React.createElement("div", {className: "ui error message"}), 
            React.createElement("div", {className: "field"}, 
                React.createElement("label", null, mf("fullName")), 
                React.createElement("div", {className: "ui icon input"}, 
                    React.createElement("input", {type: "text", placeholder: mf("nameAndSurename"), id: "name", ref: "name"}), 
                    React.createElement("i", {className: "user icon"}))), 
            React.createElement("div", {className: "field"}, 
                React.createElement("label", null, mf("email")), 
                React.createElement("div", {className: "ui icon input"}, 
                    React.createElement("input", {type: "text", placeholder: mf("emailAddress"), id: "email", ref: "email"}), 
                    React.createElement("i", {className: "mail icon"}))), 
            React.createElement("div", {className: "field"}, 
                React.createElement("label", null, mf("password")), 
                React.createElement("div", {className: "ui icon input"}, 
                    React.createElement("input", {type: "password", placeholder: mf("password"), id: "password", ref: "password"}), 
                    React.createElement("i", {className: "lock icon"}))), 
            React.createElement("div", {className: "field"}, 
                React.createElement("label", null, mf("passwordAgain")), 
                React.createElement("div", {className: "ui icon input"}, 
                    React.createElement("input", {type: "password", placeholder: mf("passwordAgain"), id: "password-again", ref: "password-again"}), 
                    React.createElement("i", {className: "lock icon"}))), 
            React.createElement("div", {className: "ui equal width center aligned grid"}, 
                React.createElement("div", {className: "first column"}, 
                    React.createElement("div", {className: "ui primary button", id: "registerButton", onClick: this.register.bind(this)}, mf("signUp"))
                ), 
                React.createElement("div", {className: "ui horizontal divider"}, "Or"), 
                React.createElement("div", {className: "last column"}, 
                    React.createElement("div", {className: "green ui labeled icon button", id: "signInButton", onClick: this.props.showSignIn}, 
                        React.createElement("i", {className: "sign in icon"}), 
                        mf("signIn"))
                ))));
    }
    componentDidMount() {
        this.props.clearMessages();
        const mf = this.props.context.i18n.initTranslator("accounts");
        let rules = {
            name: {
                identifier: "name",
                rules: [{
                        type: "regExp[\\w \\w]",
                        prompt: mf("error.nameIncorrect")
                    }]
            },
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
                        prompt: mf("error.minChar7")
                    }]
            },
            passwordConfirm: {
                identifier: "password-again",
                rules: [{
                        type: "match[password]",
                        prompt: mf("error.pwdsDontMatch")
                    }]
            }
        };
        $("#signUpForm")
            .form({
            inline: true,
            fields: rules
        });
    }
}
