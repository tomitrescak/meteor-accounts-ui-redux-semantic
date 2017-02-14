import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';

import * as actions from '../actions/accounts';
import getState from '../configs/state';
import { observer } from 'mobx-react';

export interface IComponent { }

@observer
export default class ResendVerification extends React.PureComponent<IComponent, {}> {
  emailVerification(e: any, serialisedForm: any) {
    e.preventDefault();
    actions.resendVerification(serialisedForm.formData.email);
  }

  render() {
    const state = getState();
    return (
      <Form onSubmit={this.emailVerification.bind(this)} method="post">
        <Form.Input label={i18n`Email`} placeholder={i18n`Email Address`} name="email" icon="mail" />
        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={state.mutating} primary content={i18n`Email Verification`} icon="mail" />
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
