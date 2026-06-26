import { useAuth } from '../context/AuthContext';
import { useMyRequests, useMyBalances } from './useLeaves';

export const useProfile = () => {
  const { user, profile, role } = useAuth();
  const { data: myLeaves = [] } = useMyRequests();
  const { data: myBalances = [] } = useMyBalances();
  
  const joinedDate = user?.created_at ? new Date(user.created_at) : new Date();
  const joinedStr = joinedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const now = new Date();
  const diffYears = now.getFullYear() - joinedDate.getFullYear();
  const diffMonths = now.getMonth() - joinedDate.getMonth();
  const monthsSinceJoining = (diffYears * 12) + diffMonths;
  const inProbation = monthsSinceJoining < 6;

  const approvedLeaves = myLeaves.filter(l => l.status === 'approved').length;
  const pendingLeaves = myLeaves.filter(l => l.status === 'pending').length;

  return {
    user,
    profile,
    role,
    myLeaves,
    myBalances,
    joinedStr,
    inProbation,
    approvedLeaves,
    pendingLeaves
  };
};
