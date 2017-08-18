import * as React from 'react';
import { AccountsRoot } from '../accounts_root_view';
import { mount } from 'enzyme';
import * as sinon from 'sinon';
import { getAccountState, AccountsView, State } from '../../index';
import { User, RegisterProfile } from '../../configs/user_model';
import { create } from './test_data';
import { Segment } from 'semantic-ui-react';

describe('AccountsViewTest', () => {
  const data = {
    // css: 'ui inverted segment',
    story: 'Sign In',
    info: '',
    folder: 'Accounts',
    get state() {
      return getAccountState({ cache: false });
      // state.profileData = undefined;
      // delete state.user;
      // delete state.userId;

      // return state;
    },
    get component() {
      const state = this.state;
      state.setView('signIn');
      return <AccountsRoot state={this.state} extraFields={() => null} />;
    }
  };

  // needed for stories
  config(data);

  it('Renders root view', function() {
    const wrapper = mount(data.component);
    wrapper.find('input[name="email"]').change('my@email.com');
    wrapper.find('input[name="password"]').change('password');

    wrapper.should.matchSnapshot();
  });

  it('Renders inverted view', function() {
    const state = data.state;
    state.setView('signIn');
    const wrapper = mount(<Segment inverted><AccountsView state={state} extraFields={() => null} inverted={true} /></Segment>);

    wrapper.should.matchSnapshot();
  });

  it('Shows registration screen when clicking on "Register"', function() {
    const wrapper = mount(data.component);
    wrapper.find('input[name="email"]').change(create.testEmail);

    wrapper.findWhere(w => w.prop('content') === 'Register').simulate('click');
    wrapper.should.matchSnapshot();
  });

  it('Shows forgot password screen when clicking on "Forgot Password?"', function() {
    const wrapper = mount(data.component);
    wrapper.find('input[name="email"]').change(create.testEmail);

    wrapper.findWhere(w => w.name() === 'a' && w.text() === 'Forgot Password?').simulate('click');

    wrapper.should.matchSnapshot();
  });

  it('Shows verification screen when clicking on "Re-send verification"', function() {
    const wrapper = mount(data.component);
    wrapper.find('input[name="email"]').change(create.testEmail);

    wrapper.findWhere(w => w.name() === 'a' && w.text() === 'Re-send verification').simulate('click');
    wrapper.should.matchSnapshot();
  });

  it('Calls "Sign In" when clicked on the button', function() {
    const wrapper = mount(data.component);
    const state: State<User, RegisterProfile> = wrapper.prop('state') as any;
    const saveStub = sinon.stub(state, 'signIn');

    wrapper.find('input[name="email"]').change(create.testEmail);
    wrapper.find('input[name="password"]').change(create.testPassword);

    wrapper.find('button[type="submit"]').simulate('submit');

    // saveStub.should.have.been.called;
    saveStub.should.have.been.calledWith(create.testEmail, create.testPassword, state.profileData);
  });

  // it('Renders sign-in view', function() {
  //   const state = data.state;
  //   state.view = 'signIn';
  //   const view = <AccountsView state={state} extraFields={null} />;

  //   should(mount(view)).matchSnapshot();
  // });
});

export const AccountsViewTest = global.fuseExport;
