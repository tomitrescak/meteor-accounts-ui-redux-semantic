import * as React from 'react';
import * as sinon from 'sinon';
import { mount } from 'enzyme';

import { User } from '../../configs/user_model';
import { getAccountState, AccountsView } from '../../index';
import { create } from './test_data';
import { Segment } from 'semantic-ui-react';

const token = 'token1';

describe('ResetPasswordViewTest', () => {
  const data = {
    // css: 'ui inverted segment',
    story: 'ResetPassword',
    info: '',
    folder: 'Accounts',
    get state() {
      return getAccountState({ cache: false });
    },
    get component() {
      const state = this.state;
      state.setProfileData('name: String');
      state.setView('resetPassword');
      state.setToken(token);
      sinon.spy(state, 'resetPassword');
      sinon.stub(state, 'mutate').callsFake(() => {});
      return <AccountsView state={state} extraFields={() => null} />;
    }
  };

  // needed for stories
  config(data);

  it('Renders view', function() {
    const wrapper = mount(data.component);
    wrapper.find('input[name="password1"]').change(create.testPassword);
    wrapper.find('input[name="password2"]').change(create.testPassword);
    wrapper.should.matchSnapshot();
  });

  it('Renders inverted view', function() {
    const state = data.state;
    state.setView('resetPassword');
    const wrapper = mount(<Segment inverted><AccountsView state={state} extraFields={() => null} inverted={true} /></Segment>);

    wrapper.should.matchSnapshot();
  });

  it('Shows error messages', function() {
    const wrapper = mount(data.component);

    wrapper.find('input[name="password1"]').change('123');
    wrapper.find('button[type="submit"]').simulate('submit');
    wrapper.should.matchSnapshot();

    wrapper.find('input[name="password1"]').change(create.testPassword);
    wrapper.find('input[name="password2"]').change(create.testPassword + '1');

    wrapper.find('button[type="submit"]').simulate('submit');
    wrapper.should.matchSnapshot();
  });


  it('Calls "resetPassword" when clicked on the button', function() {
    const wrapper = mount(data.component);
    const state = wrapper.prop<App.Accounts.State<User>>('state');

    wrapper.find('input[name="password1"]').change(create.testPassword);
    wrapper.find('input[name="password2"]').change(create.testPassword);

    wrapper.find('button[type="submit"]').simulate('submit');

    // saveStub.should.have.been.called;
    state.resetPassword.should.have.been.calledWith(token, create.testPassword, create.testPassword);
  });

  it('Shows sign in screen when clicking on "Sign In"', function() {
    const wrapper = mount(data.component);
    wrapper.findWhere(w => w.prop('content') === 'Sign In').simulate('click');
    wrapper.should.matchSnapshot();
  });

});

export const LogOutViewTest = global.fuseExport;
