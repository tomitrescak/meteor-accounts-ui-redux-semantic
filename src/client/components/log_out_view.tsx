import React, { Component } from "react";

export interface IComponentProps {
  context: IContext;
}

export interface IComponentActions {
  signOut: () => void;
  context: IContext;
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
