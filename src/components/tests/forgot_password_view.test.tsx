import * as React from 'react';
import { AccountsRoot } from '../accounts_root_view';
import { mount } from 'enzyme';
import * as sinon from 'sinon';
import { User, RegisterProfile } from '../../configs/user_model';
import { create } from './test_data';
import { getAccountState, State } from '../../index';
import { Segment } from 'semantic-ui-react';

describe('ForgotPasswordViewTest', () => {
  const data = {
    // css: 'ui inverted segment',
    story: 'Forgot Password',
    info: '',
    folder: 'Accounts',
    get state() {
      return getAccountState({ cache: false });
    },
    get component() {
      const state = this.state;
      state.setView('forgotPassword');
      return <AccountsRoot state={state} extraFields={() => null} />;
    }
  };

  // needed for stories
  config(data);

  it('Renders root view', function() {
    const wrapper = mount(data.component);
    wrapper.find('input[name="email"]').change('my@email.com');
    wrapper.should.matchSnapshot();
  });

  it('Renders inverted root view', function() {
    const state = data.state;
    state.setView('forgotPassword');
    const wrapper = mount(<Segment inverted><AccountsRoot state={state} extraFields={() => null} inverted={true} /></Segment>);

    wrapper.find('input[name="email"]').change('my@email.com');
    wrapper.should.matchSnapshot();
  });

  it('Shows sign in screen when clicking on "Sign In"', function() {
    const wrapper = mount(data.component);
    wrapper.findWhere(w => w.prop('content') === 'Sign In').simulate('click');
    wrapper.should.matchSnapshot();
  });

  it('Calls "emailResetLink" when clicked on the button', function() {
    const wrapper = mount(data.component);
    const state: State<User, RegisterProfile> = wrapper.prop('state') as any;
    const saveStub = sinon.stub(state, 'emailResetLink');

    wrapper.find('input[name="email"]').change(create.testEmail);
    wrapper.find('button[type="submit"]').simulate('submit');

    // saveStub.should.have.been.called;
    saveStub.should.have.been.calledWith(create.testEmail);
  });

});

export const ForgotPasswordViewTest = global.fuseExport;
