import * as React from 'react';
import * as Form from 'semantic-ui-mobx';

import i18n from 'es2015-i18n-tag';
import { Grid, Button, Divider } from 'semantic-ui-react';

import { observer } from 'mobx-react';
import { ISimpleComponent } from './shared';

@observer
export default class ForgotPassword extends React.PureComponent<ISimpleComponent, {}> {

  emailResetLink = (e: any) => {
    e.preventDefault();
    this.props.state.emailResetLink(this.props.state.loginEmail);
  };

  showSignIn = () => {
    this.props.state.showSignIn();
  }

  render() {
    const currentState = this.props.state;
    return (
      <Form.Form onSubmit={this.emailResetLink} className={this.props.inverted ? 'inverted' : ''}>
        <Form.Input
          icon="mail"
          label={i18n`Email`}
          placeholder={i18n`Email Address`}
          name="email"
          owner={Form.getField(this.props.state, 'loginEmail')}
        />
        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button
                type="submit"
                loading={currentState.mutating}
                primary
                content={i18n`Email Reset Link`}
                icon="mail"
              />
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
