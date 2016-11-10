import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Button } from 'semantic-ui-react';

export interface IComponentActions {
  signOut: () => void;
}

interface IComponent extends IComponentActions { }

const View = ({signOut }: IComponentActions) => {
  return (
    <Button primary content={i18n`Sign Out`} onClick={signOut} />
  );
};

export default View;
