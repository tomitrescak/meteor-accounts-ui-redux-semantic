
import * as React from 'react';

import { getAccountState, State } from '../../index';
import { AccountsRoot } from '../accounts_root_view';
import { User } from '../../configs/user_model';
import { mount } from 'enzyme';

describe('RootViewTest', function() {
  const data = {
    // css: 'ui inverted segment',
    story: 'Root View',
    info: '',
    folder: 'Accounts',
    get state() {
      return getAccountState({ cache: false });
    },
    get component() {
      return this.componentWithState((s) => { s.setView('signIn') });
    },
    componentWithState(modifyState: (state: State<User>) => void = state => null) {
      const state = getAccountState({ cache: false });
      modifyState(state);
      return <AccountsRoot state={state} extraFields={() => null} />;
    }
  };

  config(data);

  it('Renders error message', function() {
    const wrapper = mount(data.componentWithState(s => s.showError('Some error')));
    wrapper.should.matchSnapshot();
  });

  it('Renders info message', function() {
    const wrapper = mount(data.componentWithState(s => s.showInfo('Some info')));
    wrapper.should.matchSnapshot();
  });

  it('Renders log out view', function() {
    const wrapper = mount(data.componentWithState(s => s.setView('loggedIn')));
    wrapper.should.matchSnapshot();
  });

  
});
