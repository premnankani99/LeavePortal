import { useRegisterForm } from '../hooks/useRegisterForm';
import RegisterHeader from '../components/auth/RegisterHeader';
import RegisterForm from '../components/auth/RegisterForm';

export default function Register() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    loading,
    showPassword,
    setShowPassword,
    handleRegister
  } = useRegisterForm();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <RegisterHeader />

      <RegisterForm 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fullName={fullName}
        setFullName={setFullName}
        loading={loading}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        handleRegister={handleRegister}
      />

    </div>
  );
}
