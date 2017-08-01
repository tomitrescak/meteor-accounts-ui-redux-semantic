import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Grid, Button, Divider } from 'semantic-ui-react';

import { observer } from 'mobx-react';
import { observable, toJS } from 'mobx';
import { IRegistrationComponent } from './shared';

import * as Form from 'semantic-ui-mobx';

@observer
export default class SignUp extends React.PureComponent<IRegistrationComponent, {}> {
  register(e: any) {
    e.preventDefault();

    const currentState = this.props.state;

    if (!currentState.loginEmail.isValid() ||
        !currentState.registerName.isValid() ||
        !currentState.registerPassword1.isValid() ||
        !currentState.registerPassword2.isValid()) {
      return;
    }

    if (!currentState.user.profile.json) {
      throw new Error('You need to implement json() and parse() functions in user and profile!');
    }

    this.props.state.register(
      currentState.registerName.value,
      currentState.loginEmail.value ? currentState.loginEmail.value.toLowerCase() : '',
      currentState.registerPassword1.value,
      currentState.registerPassword2.value,
      currentState.profileData,
      currentState.user.profile.json()
    );
  }

  handleChange = (_e: React.SyntheticEvent<HTMLInputElement>, { name, value }: NameValuePair) => {
    this[name] = value;
  };

  render() {
    const currentState = this.props.state;

    return (
      <Form.Form onSubmit={this.register.bind(this)} method="post" className={this.props.inverted ? 'inverted' : ''}>
        <Form.Input
          label={i18n`Name and Surname`}
          placeholder={i18n`Your full name`}
          name="name"
          icon="user"
          owner={currentState.registerName}
        />
        <Form.Input
          icon="mail"
          label={i18n`Email`}
          placeholder={i18n`Email Address`}
          name="email"
          owner={currentState.loginEmail}
        />
        <Form.Input
          type="password"
          label={i18n`Password`}
          placeholder={i18n`Password`}
          name="password1"
          owner={currentState.registerPassword1}
        />
        <Form.Input
          type="password"
          label={i18n`Password again`}
          placeholder={i18n`Password`}
          name="password2"
          owner={currentState.registerPassword2}
        />

        {this.props.extraFields(currentState.user.profile)}

        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={currentState.mutating} primary content={i18n`Register`} />
            </Grid.Column>
          </Grid.Row>
          <Divider horizontal>{i18n`Or`}</Divider>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button
                type="button"
                onClick={currentState.showSignIn}
                color="green"
                labelPosition="left"
                content={i18n`Sign In`}
                icon="sign in"
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form.Form>
    );
  }
}
