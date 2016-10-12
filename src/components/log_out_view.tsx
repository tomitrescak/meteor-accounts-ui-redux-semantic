import * as React from 'react';

export interface IComponentProps {
  context: AccountsUI.Context;
}

export interface IComponentActions {
  signOut: () => void;
  context: AccountsUI.Context;
}

interface IComponent extends IComponentProps, IComponentActions { }

const View = ({signOut, context}: IComponentActions) => {
  const mf = context.i18n.initTranslator('accounts');
  return (
    <div className="ui primary button" onClick={signOut}>
      { mf('signOut') }
    </div>
  );
};

export default View;
