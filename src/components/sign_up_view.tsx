import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';

export interface IComponentActions {
  clearMessages: () => void;
  register: (name: string, email: string, pass1: string, pass2: string, callback: Function) => void;
  showSignIn: () => void;
}

export interface IComponent extends IComponentActions { }

export interface IState {
  loading: boolean;
}

export default class SignUp extends React.Component<IComponent, IState> {
  constructor() {
    super();
    this.state = { loading: false };
  }

  register(e: any, serialisedForm: any) {
    e.preventDefault();

    this.setState({ loading: true });

    const name = serialisedForm.name;
    const email = serialisedForm.email;
    const pass1 = serialisedForm.password1;
    const pass2 = serialisedForm.password2;

    this.props.register(name, email, pass1, pass2, () => {
      this.setState({ loading: false });
    });
  }

  render() {
    return (
      <Form onSubmit={this.register.bind(this)} method="post">
        <Form.Input label={i18n`Name and Surename`} placeholder={i18n`Your full name`} name="name" icon="user" />
        <Form.Input icon="mail" label={i18n`Email`} placeholder={i18n`Email Address`} name="email" />
        <Form.Input type="password" label={i18n`Password`} placeholder={i18n`Password`} name="password1" />
        <Form.Input type="password" label={i18n`Password again`} placeholder={i18n`Password`} name="password2" />

        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={this.state.loading} primary content={i18n`Register`} />
            </Grid.Column>
          </Grid.Row>
          <Divider horizontal>{i18n`Or`}</Divider>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="button" onClick={this.props.showSignIn} color="green" labelPosition="left" content={i18n`Sign In`} icon="signup" />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    );
  }
}
