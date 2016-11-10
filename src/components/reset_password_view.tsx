import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';

export interface IComponentActions {
  clearMessages: () => void;
  resetPassword: (token: string, pass1: string, pass2: string, callback: Function) => void;
  showSignIn: () => void;
  token: string;
}

export interface IComponent extends IComponentActions { }

export interface IState {
  loading: boolean;
}

export default class ResetPassword extends React.Component<IComponent, IState> {
  constructor() {
    super();
    this.state = { loading: false };
  }

  resetPassword(e: any, serialisedForm: any) {
    e.preventDefault();
    this.setState({ loading: true });

    this.props.resetPassword(this.props.token, serialisedForm.password1, serialisedForm.password2, () => {
      this.setState({ loading: false });
    });
  }

  render() {

    return (
      <Form onSubmit={this.resetPassword.bind(this)} method="post">
        <Form.Input type="password" label={i18n`Password`} placeholder={i18n`Password`} name="password1" />
        <Form.Input type="password" label={i18n`Password again`} placeholder={i18n`Password`} name="password2" />

        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={this.state.loading} color="red" content={i18n`Reset Password`} />
            </Grid.Column>
          </Grid.Row>
          <Divider horizontal>{i18n`Or`}</Divider>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="button" onClick={this.props.showSignIn} color="red" labelPosition="left" content={i18n`Sign In`} icon="signup" />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    );
  }
}
