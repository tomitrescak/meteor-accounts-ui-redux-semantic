import * as React from 'react';
import { Dropdown, Icon, Menu } from 'semantic-ui-react';
import i18n from 'es2015-i18n-tag';
import getState from '../configs/state';

import { observer } from 'mobx-react';

export interface IComponentProps {
  showUserName: boolean;
  userName: string;
  userId: string;
  extraItems: any[];
}


export interface IComponent extends IComponentProps { }

export const UserView = observer(({ showUserName, extraItems }: IComponent ) => {
  const state = getState();
  if (!state.userId) {
    return <span></span>;
  };
  extraItems = extraItems ? extraItems.slice(0) : [];
  extraItems.unshift(<Dropdown.Item key="sign_out" text={i18n`Sign Out`} icon="sign out" onClick={state.logOut} />);

  const UserNameView = <span><Icon name="user" />{showUserName ? state.user.profile.name : ''}</span>;
  const extras = {trigger : UserNameView};
  return (
    <Menu.Item as={Dropdown} className="dropdown" {...extras}>
      <Dropdown.Menu>
        { extraItems }
      </Dropdown.Menu>
    </Menu.Item>
  );
});

UserView.displayName = 'UserView';
export default UserView;

  // <div className="ui dropdown item" id="userMenu">
  //       <i className="user icon" />
  //       { this.props.userName }
  //       <i className="caret down icon" />
  //       <div className="menu">
  //         <a className="item" id="signOut" onClick={this.props.signOut}><i className="sign out icon" />{ mf('signOut') }</a>
  //       </div>
  //     </div>
