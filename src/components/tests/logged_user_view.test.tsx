import * as React from 'react';
import * as sinon from 'sinon';
import { mount } from 'enzyme';

import { UserView } from '../logged_user_view';
import { User } from '../../configs/user_model';
import { getAccountState } from '../../index';
import { Menu, Dropdown } from 'semantic-ui-react';

describe('LoggedViewTest', () => {
  const data = {
    // css: 'ui inverted segment',
    story: 'Menu View',
    info: '',
    folder: 'Accounts',
    showUserName: true,
    extraItems: null as any[],
    get component() {
      return data.componentWithState(state => {
        state.setUserId('1');
        state.setUser({
          _id: '2',
          roles: [],
          emails: [{ address: '', verified: true }],
          profile: { name: 'Tomas Trescak' }
        });
        return state;
      });
    },
    componentWithState(
      modifyState: (state: App.Accounts.State<User>) => App.Accounts.State<User> = state => state,
      dropdownItems: any = undefined
    ) {
      const state = modifyState(getAccountState({ cache: false }));
      sinon.stub(state, 'logOut');

      const extraItems = dropdownItems === undefined ? [
        <Dropdown.Item key="profile" text={`Profile`} icon="user" />,
        <Dropdown.Item key="stats" text={`Statistics`} icon="doctor" />
      ] : null;

      return (
        <Menu>
          <Menu.Item>Application</Menu.Item>
          <Menu.Menu position="right">
            <UserView state={state} showUserName={data.showUserName} extraItems={extraItems} />
          </Menu.Menu>
        </Menu>
      );
    }
  };

  // needed for stories
  config(data);

  it('Logged in view with user name', function() {
    data.showUserName = true;
    const wrapper = mount(data.component);
    wrapper.should.matchSnapshot();
  });

  it('Logged in view no user name', function() {
    data.showUserName = false;
    const wrapper = mount(data.component);
    wrapper.should.matchSnapshot();
  });

  it('Logged in displays by default "log out" dropdown ', function() {
    data.showUserName = false;
    const wrapper = mount(data.componentWithState(s => {
      s.setUserId('1');
      return s;
    }, null));

    wrapper.find('DropdownItem').length.should.equal(1);
    wrapper.should.matchSnapshot();
  });

  it('Logged out view', function() {
    data.showUserName = true;
    const wrapper = mount(
      data.componentWithState(s => {
        s.setUserId(null);
        return s;
      })
    );
    wrapper.should.matchSnapshot();
  });

  it('Renders with default state', function() {
    const wrapper = mount(<Menu><UserView /></Menu>);
    wrapper.should.matchSnapshot();
  });

  it('Calls "logOut" when clicked on the button', function() {
    const wrapper = mount(data.component);
    const userView = wrapper.find('UserView');
    const state: App.Accounts.State<User> = userView.prop('state') as any;

    wrapper.find('DropdownItem').at(0).simulate('click');

    // saveStub.should.have.been.called;
    state.logOut.should.have.been.called;
  });
});

export const LoggedViewTest = global.fuseExport;
