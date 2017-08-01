import { setupLuis, setupBddBridge } from 'wafl';
import { startTests, render } from 'luis';

import './styles/luis.css';
import './styles/semantic.min.css';


setupLuis();
import '../components/tests/sign_in_view.test';
import '../components/tests/register_view.test';

// setupLuis(false);
// import * as SignInTests from '../components/tests/sign_in_view.test';
// import * as SignUpTests from '../components/tests/register_view.test';

// startTests([
//   SignInTests,
//   SignUpTests
// ]);
render();
