import * as React from 'react';
import SignIn from './sign_in_view';
import ForgotPassword from './forgot_password_view';
import ResendVerification from './resend_verification_view';
import ResetPassword from './reset_password_view';
import Register from './sign_up_view';
import LogOutView from './log_out_view';
import { observer } from 'mobx-react';

import { IRegistrationComponent, ISimpleComponent } from './shared';

export type IComponent = IRegistrationComponent | ISimpleComponent;

export const Navigation = observer((props: IComponent) =>
  <div>
    {props.state.view === 'forgotPassword' && <ForgotPassword {...props} />}
    {props.state.view === 'resendVerification' && <ResendVerification {...props} />}
    {props.state.view === 'resetPassword' && <ResetPassword token={props.state.token} {...props} />}
    {props.state.view === 'signIn' && <SignIn {...props} />}
    {props.state.view === 'register' && <Register {...props as IRegistrationComponent} />}
    {props.state.view === 'loggedIn' && <LogOutView {...props} />}
  </div>
);

@observer
export class AccountsRoot extends React.Component<IRegistrationComponent, {}> {
  static displayName = 'AccountsView';

  render() {
    const currentState = this.props.state;

    // const { error } = this.props;
    return (
      <div>
        {currentState.error &&
          <div className="ui red message">
            {currentState.error}
          </div>}
        {currentState.info &&
          <div className="ui green message">
            {currentState.info}
          </div>}
        <Navigation extraFields={this.props.extraFields} state={currentState} inverted={this.props.inverted} />
      </div>
    );
  }
}

export default AccountsRoot;
