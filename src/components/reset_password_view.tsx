import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';

import * as actions from '../actions/accounts';
import getState from '../configs/state';

export interface IComponent {
  token: string;
}

export interface IState {
  loading: boolean;
}

export default class ResetPassword extends React.Component<IComponent, IState> {
  constructor() {
    super();
    this.state = { loading: false };
  }

  resetPassword(e: any, serialisedForm: any) {
    const state = getState();
    e.preventDefault();
    this.setState({ loading: true });

    actions.resetPassword(this.props.token, serialisedForm.formData.password1, serialisedForm.formData.password2, state.profileData, () => {
      this.setState({ loading: false });
    });
  }

  render() {
    const state = getState();
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
              <Button type="button" onClick={state.showSignIn} color="red" labelPosition="left" content={i18n`Sign In`} icon="signup" />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    );
  }
}
