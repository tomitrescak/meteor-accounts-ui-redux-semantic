import { setupLuis } from 'wafl';
import { render } from 'luis';

import './styles/luis.css';
import './styles/semantic.min.css';

global.gql = () => {/**/}

setupLuis();

import '../components/tests/sign_in_view.test';
import '../components/tests/register_view.test';
import '../components/tests/forgot_password_view.test';
import '../components/tests/log_out_view.test';
import '../components/tests/logged_user_view.test';
import '../components/tests/resend_verification_view.test';
import '../components/tests/reset_password_view.test';
import '../components/tests/root_view.test';
// setupLuis(false);
// import * as SignInTests from '../components/tests/sign_in_view.test';
// import * as SignUpTests from '../components/tests/register_view.test';

// startTests([
//   SignInTests,
//   SignUpTests
// ]);
render();
