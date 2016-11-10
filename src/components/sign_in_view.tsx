import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';
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

export interface IComponentActions {
  clearMessages: () => void;
  showForgotPassword: () => void;
  showResendVerification: () => void;
  showRegister: () => void;
  signIn: (userName: string, password: string, callback: Function) => void;
}

export interface IComponent extends IComponentActions { }

export interface IState {
  loading: boolean;
}

export default class SignIn extends React.Component<IComponent, IState> {
  constructor() {
    super();
    this.state = { loading: false };
  }

  signIn(e: any, serialisedForm: any) {
    e.preventDefault();

    this.setState({ loading: true });
    const email = serialisedForm.email;
    const password = serialisedForm.password;

    this.props.signIn(email, password, () => {
      this.state = { loading: false };
    });
  }

  render() {
    return (
      <Form onSubmit={this.signIn.bind(this)} method="post">
        <Form.Input icon="mail" label={i18n`Email`} placeholder={i18n`Email Address`} name="email" />
        <Form.Input icon="lock" name="password" type="password" label={i18n`Password`} />
        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="left">
              <a onClick={this.props.showForgotPassword} style={pointer}>{i18n`Forgot Password?`}</a>
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Button loading={this.state.loading} type="submit" primary content={i18n`Sign In`} icon="sign in" />
            </Grid.Column>
            <Grid.Column textAlign="right">
              <a onClick={this.props.showResendVerification} style={pointer}>{i18n`Re-send verification`}</a>
            </Grid.Column>
          </Grid.Row>
          <Divider horizontal>{i18n`Or`}</Divider>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="button" onClick={this.props.showRegister} color="green" labelPosition="left" content={i18n`Register`} icon="signup" />
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
