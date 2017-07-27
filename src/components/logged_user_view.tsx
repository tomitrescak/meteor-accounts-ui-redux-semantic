import * as React from 'react';
import { Dropdown, Icon, Menu } from 'semantic-ui-react';
import i18n from 'es2015-i18n-tag';

import { observer } from 'mobx-react';
import { getAccountState } from '../configs/state';
import { ISimpleComponent } from './shared';

export interface IComponent extends ISimpleComponent {
  showUserName?: boolean;
  extraItems?: any[];
}


@observer
export class UserView extends React.PureComponent<IComponent, {}> {
  render() {
    const currentState = this.props.state || getAccountState();
    if (!currentState.userId) {
      return <span></span>;
    };
    let extraItems = this.props.extraItems ? this.props.extraItems.slice(0) : [];
    extraItems.unshift(<Dropdown.Item key="sign_out" text={i18n`Sign Out`} icon="sign out" onClick={currentState.logOut} />);

    const UserNameView = <span><Icon name="user" />{this.props.showUserName ? currentState.user.profile.name : ''}</span>;
    const extras: any = { trigger: UserNameView };
    return (
      <Menu.Item as={Dropdown} className="dropdown" {...extras}>
        <Dropdown.Menu>
          {extraItems}
        </Dropdown.Menu>
      </Menu.Item>
    );
  }
};

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
