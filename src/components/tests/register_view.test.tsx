import * as React from 'react';
import * as sinon from 'sinon';
import * as Form from 'semantic-ui-mobx';

import { mount, ReactWrapper } from 'enzyme';
import { create } from './test_data';
import { AccountsRoot } from '../accounts_root_view';
import { getAccountState, State } from '../../index';

import { User, RegisterProfile, UserProfileModel } from '../../configs/user_model';
import { Segment } from 'semantic-ui-react';
import { observable } from 'mobx';
import { CustomRegisterProfile } from '../../tests/tests_shared';

class InvalidProfile extends RegisterProfile {
  @observable some: string;
}

class CustomUser extends User {
  profile: UserProfileModel;

  static create(data: any) {
    return new CustomUser(data);
  }

  constructor(data: any) {
    super(data);
    this.profile = new UserProfileModel(data.profile);
  }
}

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
      return getAccountState({
        cache: false,
        createUser: CustomUser.create,
        profileType: new CustomRegisterProfile()
      });
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
                owner={Form.getField(profile, 'organisation')}
                name="organisation"
              />,
              <Form.Input
                key="interest"
                name="interest"
                label="Interest"
                placeholder="Your interest"
                owner={Form.getField(profile, 'interest')}
                icon="lock"
              />
            ];
          }}
        />
      );
    }
  };

  // needed for stories
  config(data);

  function fill(wrapper: ReactWrapper<{}, {}>, extras = true) {
    wrapper.find('input[name="name"]').change(create.testName);
    wrapper.find('input[name="email"]').change(create.testEmail);
    wrapper.find('input[name="password1"]').change(create.testPassword);
    wrapper.find('input[name="password2"]').change(create.testPassword);
    
    if (extras) {
      wrapper.find('Dropdown').select(1);
      wrapper.find('input[name="interest"]').change('My Interest');
    }
  }

  it('renders register view', function() {
    const wrapper = mount(data.component);
    fill(wrapper);
    wrapper.should.matchSnapshot();
  });

  it('Renders inverted view', function() {
    const state = data.state;
    state.setView('register');
    const wrapper = mount(
      <Segment inverted>
        <AccountsRoot state={state} extraFields={() => null} inverted={true} />
      </Segment>
    );

    wrapper.should.matchSnapshot();
  });

  it('detects incorrect profile', function() {
    const state = getAccountState({
      cache: false,
      createUser: CustomUser.create,
      profileType: new InvalidProfile()
    });
    state.setView('register');
    // console.log(state.registerProfile)
    const wrapper = mount(
      <Segment inverted>
        <AccountsRoot state={state} extraFields={() => null} inverted={true} />
      </Segment>
    );
    fill(wrapper, false);

    (() => wrapper.find('form').simulate('submit')).should.throw(
      'json() not implemented!'
    );
  });

  it('calls registration function', function() {
    const wrapper = mount(data.component);
    const state: State<User, RegisterProfile> = wrapper.prop('state') as any;
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
    const state = wrapper.prop<State<User, RegisterProfile>>('state');
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

  it('Self initialises registerProfile model', function() {
    const state = data.state;

    state.setUser(create.userModel({ _id: '1', roles: [], profile: { name: 'Tomas' } }));

    state.user.profile.name.should.equal('Tomas');
  });
});

export const AccountsRegisterTest = global.fuseExport;
