import { useEmployeeDashboard } from '../hooks/useEmployeeDashboard';
import WelcomeBanner from '../components/employee-dashboard/WelcomeBanner';
import QuickActions from '../components/employee-dashboard/QuickActions';
import DashboardStats from '../components/employee-dashboard/DashboardStats';
import LeaveRulesCard from '../components/employee-dashboard/LeaveRulesCard';

export default function EmployeeDashboard() {
  const {
    stats,
    monthsSinceJoining,
    availablePaid,
    daysTakenThisMonth,
    inProbation,
    firstName,
    greeting
  } = useEmployeeDashboard();

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-8 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <WelcomeBanner 
        greeting={greeting} 
        firstName={firstName} 
        stats={stats} 
      />

      <QuickActions />

      <DashboardStats 
        stats={stats} 
      />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
        <LeaveRulesCard 
          inProbation={inProbation} 
          monthsSinceJoining={monthsSinceJoining} 
          availablePaid={availablePaid} 
          daysTakenThisMonth={daysTakenThisMonth} 
        />
      </div>
      
    </div>
  );
}
