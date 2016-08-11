import React, { Component } from "react";

export interface IComponentProps {
  context: IAccountsUiContext;
  userName: string;
  userId: string;
}

export interface IComponentActions {
  signOut: () => void;
  context: IAccountsUiContext;
}

interface IComponent extends IComponentProps, IComponentActions { }

function waitInit() {
  $("#userMenu").dropdown({ on: "hover" });
}

export default class UserView extends Component<IComponent, {}> {
  render() {
    const mf = this.props.context.i18n.initTranslator("accounts");

    if (!this.props.userId) {
      return <span></span>;
    };

    return (
      <div className="ui dropdown item" id="userMenu">
        <i className="user icon" />
        { this.props.userName }
        <i className="caret down icon" />
        <div className="menu">
          <a className="item" id="signOut" onClick={this.props.signOut}><i className="sign out icon" />{ mf("signOut") }</a>
        </div>
      </div>
    );
  }

  componentDidMount() {
    waitInit();
  }

  componentDidUpdate() {
    waitInit();
  }
}
