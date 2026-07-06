import { useProfile } from '../hooks/useProfile';
import ProfileCard from '../components/profile/ProfileCard';
import LeaveActivityStats from '../components/profile/LeaveActivityStats';

export default function Profile() {
  const {
    user,
    profile,
    role,
    myLeaves,
    joinedStr,
    inProbation,
    approvedLeaves,
    pendingLeaves,
    rejectedLeaves,
    withdrawnLeaves
  } = useProfile();

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-6 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full flex-1 flex flex-col">
        <div className={`grid grid-cols-1 ${role === 'employee' ? 'lg:grid-cols-3' : ''} gap-6 flex-1`}>
          
          <ProfileCard 
            user={user}
            profile={profile}
            role={role}
            joinedStr={joinedStr}
            inProbation={inProbation}
          />

          {role === 'employee' && (
            <LeaveActivityStats 
              myLeavesLength={myLeaves.length}
              approvedLeaves={approvedLeaves}
              pendingLeaves={pendingLeaves}
              rejectedLeaves={rejectedLeaves}
              withdrawnLeaves={withdrawnLeaves}
            />
          )}

        </div>
      </div>
    </div>
  );
}
