import * as React from 'react';
import * as Form from 'semantic-ui-mobx';

import i18n from 'es2015-i18n-tag';
import { Grid, Button, Divider } from 'semantic-ui-react';
import { observer } from 'mobx-react';
import { ISimpleComponent } from './shared';

export interface IComponent extends ISimpleComponent {
  token: string;
}

@observer
export default class ResetPassword extends React.PureComponent<IComponent, {}> {
  resetPassword = (e: any) => {
    const currentState = this.props.state;
    e.preventDefault();

    if (!Form.isValid(currentState, 'registerPassword1') || !Form.isValid(currentState, 'registerPassword2')) {
      return;
    }

    this.props.state.resetPassword(
      this.props.token,
      currentState.registerPassword1,
      currentState.registerPassword2,
      currentState.profileData
    );
  };

  showSignIn = () => {
    this.props.state.showSignIn();
  }

  render() {
    const state = this.props.state;
    return (
      <Form.Form
        onSubmit={this.resetPassword}
        method="post"
        className={this.props.inverted ? 'inverted' : ''}
      >
        <Form.Input
          type="password"
          label={i18n`Password`}
          placeholder={i18n`Password`}
          name="password1"
          owner={Form.requiredField(state, 'registerPassword1', Form.lengthValidator(7, 'Password needs to have at least 7 characters'))}
        />
        <Form.Input
          type="password"
          label={i18n`Password again`}
          placeholder={i18n`Password`}
          name="password2"
          owner={Form.requiredField(state, 'registerPassword2', Form.lengthValidator(7, 'Password needs to have at least 7 characters'))}
        />

        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={state.mutating} color="red" content={i18n`Reset Password`} />
            </Grid.Column>
          </Grid.Row>
          <Divider horizontal inverted={this.props.inverted}>{i18n`Or`}</Divider>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button
                type="button"
                onClick={this.showSignIn}
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
