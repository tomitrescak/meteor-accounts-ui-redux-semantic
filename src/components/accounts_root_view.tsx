import * as React from 'react';
import SignIn from './sign_in_view';
import ForgotPassword from './forgot_password_view';
import ResendVerification from './resend_verification_view';
import ResetPassword from './reset_password_view';
import Register from './sign_up_view';
import LogOutView from './log_out_view';

import getState from '../configs/state';
import { observer } from 'mobx-react';

export interface IComponent {}

@observer
export default class AccountsRoot extends React.Component<IComponent, {}> {
  static displayName = 'AccountsView';

  render() {
    const state = getState();
    // const { error } = this.props;
    return (
      <div>
        { state.error && <div className="ui red message">{ state.error }</div>  }
        { state.info && <div className="ui green message">{ state.info }</div>  }
        { state.view === 'forgotPassword' && <ForgotPassword {...this.props} />  }
        { state.view === 'resendVerification' && <ResendVerification {...this.props} /> }
        { state.view === 'resetPassword' && <ResetPassword token={state.token} {...this.props} />  }
        { state.view === 'signIn' && <SignIn {...this.props} />  }
        { state.view === 'register' && <Register {...this.props} />  }
        { state.view === 'loggedIn' && <LogOutView {...this.props} />  }
      </div>
    );
  }
}
