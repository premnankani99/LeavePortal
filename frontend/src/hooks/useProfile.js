import { useAuth } from '../context/AuthContext';
import { useMyRequests, useMyBalances } from './useLeaves';

export const useProfile = () => {
  const { user, profile, role } = useAuth();
  const { data: myLeaves = [] } = useMyRequests();
  const { data: myBalances = { available_leaves: 0, comp_off_leaves: 0 } } = useMyBalances();
  
  const joinedDate = user?.date_of_joining ? new Date(user.date_of_joining) : (user?.created_at ? new Date(user.created_at) : new Date());
  const joinedStr = joinedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const now = new Date();
  const diffYears = now.getFullYear() - joinedDate.getFullYear();
  const diffMonths = now.getMonth() - joinedDate.getMonth();
  const monthsSinceJoining = (diffYears * 12) + diffMonths;
  const inProbation = monthsSinceJoining < 6;

  const approvedLeaves = myLeaves.filter(l => l.status === 'approved').length;
  const pendingLeaves = myLeaves.filter(l => l.status === 'pending').length;
  const rejectedLeaves = myLeaves.filter(l => l.status === 'rejected').length;
  const withdrawnLeaves = myLeaves.filter(l => l.status === 'cancelled').length;

  return {
    user,
    profile,
    role,
    myLeaves,
    myBalances,
    joinedStr,
    inProbation,
    approvedLeaves,
    pendingLeaves,
    rejectedLeaves,
    withdrawnLeaves
  };
};
