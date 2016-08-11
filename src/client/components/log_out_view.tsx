import React, { Component } from "react";

export interface IComponentProps {
  context: IAccountsUiContext;
}

export interface IComponentActions {
  signOut: () => void;
  context: IAccountsUiContext;
}

interface IComponent extends IComponentProps, IComponentActions { }

const View = ({signOut, context}: IComponentActions) => {
  const mf = context.i18n.initTranslator("accounts");
  return (
    <div className="ui primary button" onClick={signOut}>
      { mf("signOut") }
    </div>
  );
};

export default View;
