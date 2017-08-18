import * as React from 'react';
import * as sinon from 'sinon';
import { mount } from 'enzyme';

import { LogOutView } from '../log_out_view';
import { User, RegisterProfile } from '../../configs/user_model';
import { getAccountState, State } from '../../index';

describe('LogOutViewTest', () => {
  const data = {
    // css: 'ui inverted segment',
    story: 'Log Out',
    info: '',
    folder: 'Accounts',
    get state() {
      return getAccountState({ cache: false });
    },
    get component() {
      const state = this.state;
      state.setView('forgotPassword');
      sinon.stub(state, 'logOut')
      return <LogOutView state={state} />;
    }
  };

  // needed for stories
  config(data);

  it('Renders view', function() {
    const wrapper = mount(data.component);
    wrapper.should.matchSnapshot();
  });


  it('Calls "logOut" when clicked on the button', function() {
    const wrapper = mount(data.component);
    const state: State<User, RegisterProfile> = wrapper.prop('state') as any;

    wrapper.find('button').simulate('click');

    // saveStub.should.have.been.called;
    state.logOut.should.have.been.called;
  });

});

export const LogOutViewTest = global.fuseExport;
