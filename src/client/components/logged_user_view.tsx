import React, { Component } from "react";

export interface IComponentProps {
  context: IContext;
  userName: string;
}

export interface IComponentActions {
  signOut: () => void;
  context: IContext;
}

interface IComponent extends IComponentProps, IComponentActions { }

export default class UserView extends Component<IComponent, {}> {
  render() {
    const mf = this.props.context.i18n.initTranslator("accounts");

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
    $("#userMenu").dropdown({ on: "hover"});
  }
}
