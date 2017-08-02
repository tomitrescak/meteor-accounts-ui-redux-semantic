import * as React from 'react';
import * as Form from 'semantic-ui-mobx';

import i18n from 'es2015-i18n-tag';
import { Grid, Button, Divider } from 'semantic-ui-react';

import { observer } from 'mobx-react';
import { ISimpleComponent } from './shared';

@observer
export class ResendVerification extends React.PureComponent<ISimpleComponent, {}> {

  emailVerification = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.props.state.resendVerification(this.props.state.loginEmail.value);
  };

  render() {
    const currentState = this.props.state;
    return (
      <Form.Form
        onSubmit={this.emailVerification.bind(this)}
        method="post"
        className={this.props.inverted ? 'inverted' : ''}
      >
        <Form.Input
          label={i18n`Email`}
          placeholder={i18n`Email Address`}
          name="email"
          icon="mail"
          owner={this.props.state.loginEmail}
        />
        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button
                type="submit"
                loading={currentState.mutating}
                primary
                content={i18n`Email Verification`}
                icon="mail"
              />
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

export default ResendVerification;
