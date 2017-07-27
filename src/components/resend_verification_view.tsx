import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';

import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { ISimpleComponent } from './shared';

@observer
export default class ResendVerification extends React.PureComponent<ISimpleComponent, {}> {
  @observable email = '';

  emailVerification = (e: any) => {
    e.preventDefault();
    this.props.state.resendVerification(this.props.state, this.email);
  }

  handleChange = (_e: React.SyntheticEvent<HTMLInputElement>, { value }: NameValuePair) => {
    this.email = value;
  }

  render() {
    const currentState = this.props.state;
    return (
      <Form onSubmit={this.emailVerification.bind(this)} method="post" className={this.props.inverted ? 'inverted' : ''}>
        <Form.Input label={i18n`Email`} placeholder={i18n`Email Address`} name="email" icon="mail" onChange={this.handleChange} />
        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={currentState.mutating} primary content={i18n`Email Verification`} icon="mail" />
            </Grid.Column>
          </Grid.Row>
          <Divider horizontal>{i18n`Or`}</Divider>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="button" onClick={currentState.showSignIn} color="green" labelPosition="left" content={i18n`Sign In`} icon="sign in" />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    );
  }
}
