import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Button } from 'semantic-ui-react';
import { ISimpleComponent } from './shared';

const View = ({ state }: ISimpleComponent) => {
  const currentState = state;
  return (
    <Button primary content={i18n`Sign Out`} onClick={state.logOut} />
  );
};

export default View;
