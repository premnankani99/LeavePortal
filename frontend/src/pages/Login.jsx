import { useLoginForm } from '../hooks/useLoginForm';
import LoginHeader from '../components/auth/LoginHeader';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    showPassword,
    setShowPassword,
    handleLogin
  } = useLoginForm();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <LoginHeader />

      <LoginForm 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loading={loading}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        handleLogin={handleLogin}
      />

    </div>
  );
}
