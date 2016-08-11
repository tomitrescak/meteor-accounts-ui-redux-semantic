import React, { Component } from "react";
function waitInit() {
    $("#userMenu").dropdown({ on: "hover" });
}
export default class UserView extends Component {
    render() {
        const mf = this.props.context.i18n.initTranslator("accounts");
        if (!this.props.userId) {
            return React.createElement("span", null);
        }
        ;
        return (React.createElement("div", {className: "ui dropdown item", id: "userMenu"}, 
            React.createElement("i", {className: "user icon"}), 
            this.props.userName, 
            React.createElement("i", {className: "caret down icon"}), 
            React.createElement("div", {className: "menu"}, 
                React.createElement("a", {className: "item", id: "signOut", onClick: this.props.signOut}, 
                    React.createElement("i", {className: "sign out icon"}), 
                    mf("signOut"))
            )));
    }
    componentDidMount() {
        waitInit();
    }
    componentDidUpdate() {
        waitInit();
    }
}
