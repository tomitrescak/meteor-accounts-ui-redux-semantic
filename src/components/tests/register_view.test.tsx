import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { Segment } from 'semantic-ui-react';
import { should } from 'fuse-test-runner';
import * as sinon from 'sinon';
import { create } from './test_data';
import { expect } from 'chai';
import { AccountsRoot } from '../accounts_root_view';
import { getAccountState } from '../../index';
import * as Form from 'semantic-ui-mobx';
import { User, UserModel } from '../../configs/user_model';
import { types } from 'mobx-state-tree';

const profileModel = types.model('Profile', {
  organisation: Form.requiredField(''),
  interest: Form.simpleField('')
}, {
  json(): any {
    return {
      organisation: this.organisation.value,
      interest: this.interest.value
    }
  }
});

const composedUserModel = types.compose('User', UserModel, {
  profile: types.optional(profileModel, {})
});

const userModel = types.optional(composedUserModel, {
  emails: [],
  roles: []
});

// const u = getAccountState({ userType: userModel });
// const g = userModel.create();

// console.log(g._id);
// console.log(g.profile.organisation.value);

// u.user.profile.organisation.onChange('23');

// console.log(u.user._id);
// console.log(u.user.profile.organisation.value);

describe('AccountsRegisterTest', () => {
  const data = {
    // css: 'ui inverted segment',
    story: 'Register',
    info: '',
    folder: 'User/Login',
    options: [{ name: 'Option 1', id: '1' }, { name: 'Option 2', id: '2' }],
    get component() {
      const state = getAccountState({ cache: false, userType: userModel });
      state.setView('register');

      return (
        <AccountsRoot
          state={state}
          extraFields={(profile: any) => {
            return [
            <Form.Select
              options={this.options.map(o => ({ text: o.name, value: o.id }))}
              key="organisation"
              label="Organisation"
              placeholder="Your home organisation"
              owner={profile.organisation}
              name="organisation"
            />,
            <Form.Input
              key="interest"
              name="interest"
              label="Interest"
              placeholder="Your interest"
              owner={profile.interest}
              icon="lock"
            />
          ]}}
        />
      );
    }
  };

  // needed for stories
  config(data);

  function fill(wrapper: ReactWrapper<{}, {}>) {
    wrapper.find('input[name="name"]').change(create.testName);
    wrapper.find('input[name="email"]').change(create.testEmail);
    wrapper.find('input[name="password1"]').change(create.testPassword);
    wrapper.find('input[name="password2"]').change(create.testPassword);
    wrapper.find('Dropdown').select(1);
    wrapper.find('input[name="interest"]').change('My Interest');
  }

  it('renders register view', function() {
    const wrapper = mount(data.component);
    fill(wrapper);
    wrapper.should.matchSnapshot();
  });

  it('calls registration function', function() {
    const wrapper = mount(data.component);
    const state: App.Accounts.State<User> = wrapper.prop('state') as any;
    const registerStub = sinon.stub(state, 'register');

    fill(wrapper);

    // check the call
    wrapper.find('form').simulate('submit');
    registerStub.should.have.been.calledWith(
      create.testName,
      create.testEmail,
      create.testPassword,
      create.testPassword,
      '',
      {
        organisation: data.options[1].id,
        interest: 'My Interest'
      }
    );
  });

  it('shows error messages', function() {
    const wrapper = mount(data.component);
    const state = wrapper.prop<App.Accounts.State<User>>('state');
    sinon.stub(state, 'mutate');

    // missing name
    fill(wrapper);
    wrapper.find('input[name="name"]').change('');
    wrapper.find('form').simulate('submit');
    wrapper.should.matchSnapshot();

    // missing email
    fill(wrapper);
    wrapper.find('input[name="email"]').change('');
    wrapper.find('form').simulate('submit');
    wrapper.should.matchSnapshot();

    // false email
    fill(wrapper);
    wrapper.find('input[name="email"]').change('bad email');
    wrapper.find('form').simulate('submit');
    wrapper.should.matchSnapshot();

    // not matching passwords
    fill(wrapper);
    wrapper.find('input[name="password2"]').change('Not matching');
    wrapper.find('form').simulate('submit');
    wrapper.should.matchSnapshot();
  });

  it('Shows sign in screen when clicking on "Sign In"', function() {
    const wrapper = mount(data.component);
    wrapper.findWhere(w => w.prop('content') === 'Sign In').simulate('click');
    wrapper.should.matchSnapshot();
  });
});

export const AccountsRegisterTest = global.fuseExport;
