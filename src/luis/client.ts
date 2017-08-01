import { setupLuis } from 'wafl';
import { startTests, render } from 'luis';

import './styles/luis.css';
import './styles/semantic.min.css';

setupLuis();

import * as SignInTests from '../components/tests/sign_in_view.test';
import * as SignUpTests from '../components/tests/register_view.test';

startTests([
  SignInTests,
  SignUpTests
]);

render();
