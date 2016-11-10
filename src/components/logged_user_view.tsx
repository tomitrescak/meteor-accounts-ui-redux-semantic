import * as React from 'react';
import { Dropdown, Icon } from 'semantic-ui-react';
import i18n from 'es2015-i18n-tag';
import { DropdownMenu } from 'semantic-ui-react-router';

export interface IComponentProps {
  userName: string;
  userId: string;
}

export interface IComponentActions {
  signOut: () => void;
}

export interface IComponent extends IComponentProps, IComponentActions { }

export const UserView = ({ userId, userName, signOut }: IComponent ) => {
  if (!userId) {
    return <span></span>;
  };

  return (
    <DropdownMenu as={Dropdown} className="dropdown" text={userName}>
      <Dropdown.Menu>
        <Dropdown.Item text={i18n`Sign Out`} icon="sign out" onClick={signOut} />
      </Dropdown.Menu>
    </DropdownMenu>
  );
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
