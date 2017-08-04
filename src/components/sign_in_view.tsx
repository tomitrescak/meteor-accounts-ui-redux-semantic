import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Grid, Button, Divider } from 'semantic-ui-react';
import * as Form from '../configs/form';

import { observer } from 'mobx-react';
import { ISimpleComponent } from './shared';

// import { style } from 'typestyle';

// const css = style({
//   '& a': {
//     cursor: 'hand'
//   },
//   '& .row': {
//     paddingBottom: '0px!important'
//   }
// });

// const anchor = style({ cursor: 'hand' });
// const row = style({ paddingBottom: '0px!important' });

const pointer = { cursor: 'pointer ' };

@observer
export default class SignIn extends React.Component<ISimpleComponent, {}> {
  constructor() {
    super();
  }

  signIn = (e: any) => {
    const state = this.props.state;
    e.preventDefault();

    this.props.state.signIn(state.loginEmail, state.loginPassword, state.profileData);
  };

  showForgotPassword = () => {
    this.props.state.showForgotPassword();
  }

  showResendVerification = () => {
    this.props.state.showResendVerification();
  }

  render() {
    const state = this.props.state;
    return (
      <Form.Form onSubmit={this.signIn} method="post" className={this.props.inverted ? 'inverted' : ''}>
        <Form.Input
          icon="mail"
          label={i18n`Email`}
          placeholder={i18n`Email Address`}
          name="email"
          owner={Form.requiredField(state, 'loginEmail', Form.emailValidator)}
        />
        <Form.Input
          icon="lock"
          name="password"
          type="password"
          label={i18n`Password`}
          owner={Form.requiredField(state, 'loginPassword', Form.lengthValidator(7, 'Password needs to have at least 7 characters'))}
        />
        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="left">
              <a onClick={this.showForgotPassword} style={pointer}>{i18n`Forgot Password?`}</a>
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Button loading={state.mutating} type="submit" primary content={i18n`Sign In`} icon="sign in" />
            </Grid.Column>
            <Grid.Column textAlign="right">
              <a onClick={this.showResendVerification} style={pointer}>{i18n`Re-send verification`}</a>
            </Grid.Column>
          </Grid.Row>
          <Divider horizontal>{i18n`Or`}</Divider>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button
                type="button"
                onClick={state.showRegister}
                color="green"
                labelPosition="left"
                content={i18n`Register`}
                icon="sign in"
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form.Form>
    );
  }
}

// <div className="ui equal width center aligned grid" style={{ marginTop: 5 }}>
//           <div className="left aligned column" style={{ paddingTop: 2 }}>
//             <div><a href="#" id="forgotPasswordButton" onClick={this.props.showForgotPassword}>{i18n`forgotPassword`}</a></div>
//           </div>
//           <div className="centered aligned">
//             <div className="ui submit primary button" onClick={this.signIn.bind(this)} id="signIn">{i18n`signIn`}</div>
//           </div>
//           <div className="right aligned column" style={{ paddingTop: 2 }}>
//             <div><a href="#" onClick={this.props.showResendVerification}>{i18n`resendVerification`}</a></div>
//           </div>
//           <div className="ui horizontal divider">
//             Or
//           </div>
//           <div className="column" style={{ paddingTop: 2 }}>
//             <div className="green ui labeled icon button" onClick={this.props.showRegister}>
//               <i className="signup icon" />
//               {i18n`signUp`}
//             </div>
//           </div>
//         </div>
