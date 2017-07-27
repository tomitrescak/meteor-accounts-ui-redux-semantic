import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';

import { observer } from 'mobx-react';
import { observable, toJS } from 'mobx';
import { IRegistrationComponent } from './shared';

@observer
export default class SignUp extends React.PureComponent<IRegistrationComponent, {}> {
  @observable name = '';
  @observable password1 = '';
  @observable password2 = '';
  @observable email = '';
  @observable profile = {};

  register(e: any) {
    e.preventDefault();

    const currentState = this.props.state;
    this.props.state.register(this.props.state, this.name, this.email ? this.email.toLowerCase() : '', this.password1, this.password2, currentState.profileData, toJS(this.profile));
  }

  handleChange = (_e: React.SyntheticEvent<HTMLInputElement>, { name, value }: NameValuePair) => {
    this[name] = value;
  }

  render() {
    const currentState = this.props.state;
    return (
      <Form onSubmit={this.register.bind(this)} method="post" className={this.props.inverted ? 'inverted' : ''}>
        <Form.Input label={i18n`Name and Surname`} placeholder={i18n`Your full name`} name="name" icon="user" onChange={this.handleChange} value={this.name} />
        <Form.Input icon="mail" label={i18n`Email`} placeholder={i18n`Email Address`} name="email" onChange={this.handleChange}  value={this.email}/>
        <Form.Input type="password" label={i18n`Password`} placeholder={i18n`Password`} name="password1" onChange={this.handleChange} value={this.password1} />
        <Form.Input type="password" label={i18n`Password again`} placeholder={i18n`Password`} name="password2" onChange={this.handleChange} value={this.password2} />

        { this.props.extraFields(this.profile) }

        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={currentState.mutating} primary content={i18n`Register`} />
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
