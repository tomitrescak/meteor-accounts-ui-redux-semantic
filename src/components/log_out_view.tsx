import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Button } from 'semantic-ui-react';

import * as actions from '../actions/accounts';
import getState from '../configs/state';

interface IComponent { }

const View = () => {
  const state = getState();
  return (
    <Button primary content={i18n`Sign Out`} onClick={state.logOut} />
  );
};

export default View;
