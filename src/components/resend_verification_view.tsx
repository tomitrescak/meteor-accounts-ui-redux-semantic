import * as React from 'react';
import i18n from 'es2015-i18n-tag';
import { Form, Grid, Button, Divider } from 'semantic-ui-react';

export interface IComponentActions {
  clearMessages: () => void;
  emailVerification: (email: string, callback: Function) => void;
  showSignIn: () => void;
}

export interface IComponent extends IComponentActions { }

export interface IState {
  loading: boolean;
}

export default class ResendVerification extends React.Component<IComponent, IState> {
  constructor() {
    super();
    this.state = { loading: false };
  }

  emailVerification(e: any, serialisedForm: any) {
    e.preventDefault();
    this.setState({ loading: true });
    this.props.emailVerification(serialisedForm.email, () => {
      this.setState({ loading: false });
    });
  }

  render() {

    return (
      <Form onSubmit={this.emailVerification.bind(this)} method="post">
        <Form.Input label={i18n`Email`} placeholder={i18n`Email Address`} name="email" icon="mail" />
        <Grid centered className="equal width">
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button type="submit" loading={this.state.loading} primary content={i18n`Email Verification`} icon="mail" />
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
