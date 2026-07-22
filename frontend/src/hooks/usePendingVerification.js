import { useAuth } from '../context/AuthContext';

export const usePendingVerification = () => {
    console.log("[Frontend Component] Rendering usePendingVerification in usePendingVerification.js");
  const { logout } = useAuth();
  
  return {
    logout
  };
};
