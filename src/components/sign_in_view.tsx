import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';

import { observer } from 'mobx-react';
import { observable } from 'mobx';
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

const pointer = { cursor: 'pointer '};

@observer
export default class SignIn extends React.Component<ISimpleComponent, {}> {
  @observable email = '';
  @observable password = '';

  constructor() {
    super();
  }

  signIn = (e: any) => {
    const currentState = this.props.state;
    e.preventDefault();

    const email = this.email;
    const password = this.password;

    this.props.state.signIn(currentState, email, password, currentState.profileData);
  }

  handleChange = (_e: React.SyntheticEvent<HTMLInputElement>, { name, value }: NameValuePair) => {
    this[name] = value;
  }

  render() {
    const state = this.props.state;
    return (
      <Form onSubmit={this.signIn} method="post" className={this.props.inverted ? 'inverted' : ''}>
        <Form.Input icon="mail" label={i18n`Email`} placeholder={i18n`Email Address`} name="email" onChange={this.handleChange} value={this.email} />
        <Form.Input icon="lock" name="password" type="password" label={i18n`Password`} onChange={this.handleChange} value={this.password} />
        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="left">
              <a onClick={state.showForgotPassword} style={pointer}>{i18n`Forgot Password?`}</a>
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Button loading={state.mutating} type="submit" primary content={i18n`Sign In`} icon="sign in" />
            </Grid.Column>
            <Grid.Column textAlign="right">
              <a onClick={state.showResendVerification} style={pointer}>{i18n`Re-send verification`}</a>
            </Grid.Column>
          </Grid.Row>
          <Divider horizontal>{i18n`Or`}</Divider>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="button" onClick={state.showRegister} color="green" labelPosition="left" content={i18n`Register`} icon="sign in" />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
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
