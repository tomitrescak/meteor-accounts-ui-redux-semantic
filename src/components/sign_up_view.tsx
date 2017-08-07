import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Grid, Button, Divider } from 'semantic-ui-react';

import { observer } from 'mobx-react';
import { IRegistrationComponent } from './shared';

import * as Form from 'semantic-ui-mobx';

@observer
export default class SignUp extends React.PureComponent<IRegistrationComponent, {}> {
  register(e: any) {
    e.preventDefault();

    const currentState = this.props.state;

    if (!currentState.registerProfile.json) {
      throw new Error('You need to implement json() and parse() functions in user and profile!');
    }

    if (
      !Form.isValid(currentState, 'loginEmail') ||
      !Form.isValid(currentState, 'registerName') ||
      !Form.isValid(currentState, 'registerPassword1') ||
      !Form.isValid(currentState, 'registerPassword2')
    ) {
      return;
    }

    // console.log(currentState.registerProfile);

    this.props.state.register(
      currentState.registerName,
      currentState.loginEmail.toLowerCase(),
      currentState.registerPassword1,
      currentState.registerPassword2,
      currentState.profileData,
      currentState.registerProfile.json()
    );
  }

  render() {
    const currentState = this.props.state;

    return (
      <Form.Form onSubmit={this.register.bind(this)} method="post" className={this.props.inverted ? 'inverted' : ''}>
        <Form.Input
          label={i18n`Name and Surname`}
          placeholder={i18n`Your full name`}
          name="name"
          icon="user"
          owner={Form.requiredField(currentState, 'registerName')}
        />
        <Form.Input
          icon="mail"
          label={i18n`Email`}
          placeholder={i18n`Email Address`}
          name="email"
          owner={Form.requiredField(currentState, 'loginEmail', Form.emailValidator)}
        />
        <Form.Input
          type="password"
          label={i18n`Password`}
          placeholder={i18n`Password`}
          name="password1"
          owner={Form.requiredField(currentState, 'registerPassword1', Form.lengthValidator(7, 'Password needs to have at least 7 characters'))}
        />
        <Form.Input
          type="password"
          label={i18n`Password again`}
          placeholder={i18n`Password`}
          name="password2"
          owner={Form.requiredField(currentState, 'registerPassword2', Form.lengthValidator(7, 'Password needs to have at least 7 characters'))}
        />

        {this.props.extraFields(currentState.registerProfile)}

        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={currentState.mutating} primary content={i18n`Register`} />
            </Grid.Column>
          </Grid.Row>
          <Divider horizontal inverted={this.props.inverted}>{i18n`Or`}</Divider>
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
