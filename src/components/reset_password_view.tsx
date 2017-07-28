import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';
import { observer } from 'mobx-react';

import { observable } from 'mobx';
import { ISimpleComponent } from './shared';

export interface IComponent extends ISimpleComponent {
  token: string;
}

@observer
export default class ResetPassword extends React.PureComponent<IComponent, {}> {
  @observable password1 = '';
  @observable password2 = '';

  resetPassword = (e: any) => {
    const currentState = this.props.state;
    e.preventDefault();

    this.props.state.resetPassword(this.props.token, this.password1, this.password2, currentState.profileData);
  }

  handleChange = (_e: React.SyntheticEvent<HTMLInputElement>, { name, value }: NameValuePair) => {
    this[name] = value;
  }

  render() {
    const state = this.props.state;
    return (
      <Form onSubmit={this.resetPassword.bind(this)} method="post" className={this.props.inverted ? 'inverted' : ''}>
        <Form.Input type="password" label={i18n`Password`} placeholder={i18n`Password`} name="password1" onChange={this.handleChange} value={this.password1} />
        <Form.Input type="password" label={i18n`Password again`} placeholder={i18n`Password`} name="password2" onChange={this.handleChange} value={this.password2} />

        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={state.mutating} color="red" content={i18n`Reset Password`} />
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
