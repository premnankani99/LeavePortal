import { useAuth } from '../context/AuthContext';

export const usePendingVerification = () => {
  const { logout } = useAuth();
  
  return {
    logout
  };
};
