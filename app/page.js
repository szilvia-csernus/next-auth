import LoginForm from '@/components/login-form';
import SignupForm from '@/components/signup-form';


export default async function Home({ searchParams }) {
  const authForm = (searchParams.mode || 'login') ? <LoginForm /> : <SignupForm />;
  return authForm;
}
