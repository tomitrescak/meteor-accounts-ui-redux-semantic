import * as React from 'react';
import * as sinon from 'sinon';
import * as Form from 'semantic-ui-mobx';

import { mount, ReactWrapper } from 'enzyme';
import { create } from './test_data';
import { AccountsRoot } from '../accounts_root_view';
import { getAccountState, State } from '../../index';

import { User, UserModel } from '../../configs/user_model';
import { Segment } from 'semantic-ui-react';
import { types } from 'mobx-state-tree';
import { registerProfileModel } from '../../tests/tests_shared';

const profileModel = types.model('Profile', {
  name: types.maybe(types.string),
  organisation: types.maybe(types.string),
  interest: types.maybe(types.string)
}, {
  json(): any {
    return {
      organisation: this.organisation,
      interest: this.interest
    }
  }
});

const invalidProfileModel = types.model('Profile', {
  some: ''
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
    css: 'ui segment m12',
    story: 'Register',
    info: '',
    folder: 'Accounts',
    options: [{ name: 'Option 1', id: '1' }, { name: 'Option 2', id: '2' }],
    get state() {
      return getAccountState({ cache: false, userType: userModel, profileType: registerProfileModel });
    },
    get component() {
      const state = this.state;
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

  it('Renders inverted view', function() {
    const state = data.state;
    state.setView('register');
    const wrapper = mount(<Segment inverted><AccountsRoot state={state} extraFields={() => null} inverted={true} /></Segment>);

    wrapper.should.matchSnapshot();
  });

  it('detects incorrect profile', function() {
    const state = getAccountState({ cache: false, userType: userModel, profileType: invalidProfileModel });
    state.setView('register');
    // console.log(state.registerProfile)
    const wrapper = mount(<Segment inverted><AccountsRoot state={state} extraFields={() => null} inverted={true} /></Segment>);

    (() => wrapper.find('form').simulate('submit')).should.throw('You need to implement json() and parse() functions in user and profile!');
  });

  it('calls registration function', function() {
    const wrapper = mount(data.component);
    const state: State<User> = wrapper.prop('state') as any;
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
    const state = wrapper.prop<State<User>>('state');
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

  xit('Self initialises registerProfile model', function() {
    const state = data.state;

    state.setUser({ roles: [], profile: { name: 'Tomas' } });

    state.user.profile.name.should.equal('Tomas');
    state.registerProfile.name.value.should.equal('Tomas');
  })
});

export const AccountsRegisterTest = global.fuseExport;
