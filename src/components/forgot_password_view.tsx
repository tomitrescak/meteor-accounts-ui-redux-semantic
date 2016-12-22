import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';

import * as actions from '../actions/accounts';
import getState from '../configs/state';

export interface IComponent { }

export interface IState {
  loading: boolean;
}

export default class ForgotPassword extends React.Component<IComponent, IState> {
  constructor() {
    super();
    this.state = { loading: false };
  }

  emailResetLink(e: any, serialisedForm: any) {
    e.preventDefault();
    this.setState({ loading: true });
    actions.emailResetLink(serialisedForm.formData.email, () => {
      this.setState({ loading: false });
    });
  }

  render() {
    const state = getState();
    return (
      <Form onSubmit={this.emailResetLink.bind(this)}>
        <Form.Input icon="mail" label={i18n`Email`} placeholder={i18n`Email Address`} name="email" />
        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={this.state.loading} primary content={i18n`Email Reset Link`} icon="mail" />
            </Grid.Column>
          </Grid.Row>
          <Divider horizontal>{i18n`Or`}</Divider>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="button" onClick={state.showSignIn} color="green" labelPosition="left" content={i18n`Sign In`} icon="sign in" />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    );
  }
}
