import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';

import * as actions from '../actions/accounts';
import getState from '../configs/state';
import { observer } from 'mobx-react';

export interface IComponent { }

@observer
export default class SignUp extends React.PureComponent<IComponent, {}> {

  register(e: any, serialisedForm: any) {
    e.preventDefault();

    const state = getState();
    const name = serialisedForm.formData.name;
    const email = serialisedForm.formData.email;
    const pass1 = serialisedForm.formData.password1;
    const pass2 = serialisedForm.formData.password2;

    actions.register(name, email, pass1, pass2, state.profileData);
  }

  render() {
    const state = getState();
    return (
      <Form onSubmit={this.register.bind(this)} method="post">
        <Form.Input label={i18n`Name and Surname`} placeholder={i18n`Your full name`} name="name" icon="user" />
        <Form.Input icon="mail" label={i18n`Email`} placeholder={i18n`Email Address`} name="email" />
        <Form.Input type="password" label={i18n`Password`} placeholder={i18n`Password`} name="password1" />
        <Form.Input type="password" label={i18n`Password again`} placeholder={i18n`Password`} name="password2" />

        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={state.mutating} primary content={i18n`Register`} />
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
