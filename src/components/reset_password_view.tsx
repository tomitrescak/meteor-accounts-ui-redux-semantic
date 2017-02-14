import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';
import { observer } from 'mobx-react';

import * as actions from '../actions/accounts';
import getState from '../configs/state';

export interface IComponent {
  token: string;
}

@observer
export default class ResetPassword extends React.PureComponent<IComponent, {}> {
  resetPassword(e: any, serialisedForm: any) {
    const state = getState();
    e.preventDefault();

    actions.resetPassword(this.props.token, serialisedForm.formData.password1, serialisedForm.formData.password2, state.profileData);
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
              <Button type="submit" loading={state.mutating} color="red" content={i18n`Reset Password`} />
            </Grid.Column>
          </Grid.Row>
          <Divider horizontal inverted>{i18n`Or`}</Divider>
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
