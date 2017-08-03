import * as React from 'react';
import * as sinon from 'sinon';
import { mount } from 'enzyme';

import { User } from '../../configs/user_model';
import { getAccountState, AccountsView, State } from '../../index';
import { create } from './test_data';
import { Segment } from 'semantic-ui-react';

describe('SendVerificationTest', () => {
  const data = {
    // css: 'ui inverted segment',
    story: 'Send Verification',
    info: '',
    folder: 'Accounts',
    get state() {
      return getAccountState({ cache: false });
    },
    get component() {
      const state = this.state;
      state.setView('resendVerification');
      sinon.stub(state, 'resendVerification')
      return <AccountsView state={state} extraFields={() => null} />;
    }
  };

  // needed for stories
  config(data);

  it('Renders view', function() {
    const wrapper = mount(data.component);
    wrapper.find('input[name="email"]').change(create.testEmail);
    wrapper.should.matchSnapshot();
  });

  it('Renders inverted root view', function() {
    const state = data.state;
    state.setView('resendVerification');
    const wrapper = mount(<Segment inverted><AccountsView state={state} extraFields={() => null} inverted={true} /></Segment>);

    wrapper.find('input[name="email"]').change('my@email.com');
    wrapper.should.matchSnapshot();
  });


  it('Calls "logOut" when clicked on the button', function() {
    const wrapper = mount(data.component);
    const state = wrapper.prop<State<User>>('state');

    wrapper.find('input[name="email"]').change(create.testEmail);
    wrapper.find('button[type="submit"]').simulate('submit');

    // saveStub.should.have.been.called;
    state.resendVerification.should.have.been.calledWith(create.testEmail);
  });

  it('Shows sign in screen when clicking on "Sign In"', function() {
    const wrapper = mount(data.component);
    wrapper.findWhere(w => w.prop('content') === 'Sign In').simulate('click');
    wrapper.should.matchSnapshot();
  });
});

export const LogOutViewTest = global.fuseExport;
