import React, { Component } from "react";

interface IComponentProps {
  context: IAccountsUiContext;
}

interface IComponentActions {
  clearMessages: () => void;
  resetPassword: (token: string, pass1: string, pass2: string, callback: Function) => void;
  showSignIn: () => void;
  token: string;
}

interface IComponent extends IComponentProps, IComponentActions { }

export default class ResetPassword extends Component<IComponent, {}> {
  context: IAccountsUiContext;

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

    return (
      <div className="ui form login" id="resetPasswordForm">
        <div className="field">
          <label>{ mf("password") }</label>
          <div className="ui icon input">
            <input type="password" placeholder={ mf("password") } ref="password" id="password" />
            <i className="lock icon" />
          </div>
        </div>
        <div className="field">
          <label>{ mf("passwordAgain") }</label>
          <div className="ui icon input">
            <input type="password" placeholder={ mf("passwordAgain") } ref="password-again" id="password-again" />
            <i className="lock icon" />
          </div>
        </div>
        <div className="ui equal width center aligned grid">
          <div className="first column">
            <div className="ui red submit button" id="resetPassword" onClick={this.resetPassword.bind(this) }>{ mf("resetYourPassword") }</div>
          </div>
          <div className="ui horizontal divider">
            Or
          </div>
          <div className="center aligned column">
            <div className="green ui labeled icon button" onClick={this.props.showSignIn}>
              <i className="sign in icon" />
              { mf("signIn") }
            </div>
          </div>
        </div>

      </div>
    );
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
