import { useAdminRequests } from '../hooks/useAdminRequests';
import ProcessedHistory from '../components/requests/ProcessedHistory';

export default function AdminLeaveHistory() {
  const {
    processedRequests
  } = useAdminRequests();

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-6 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex-1 grid grid-cols-1 gap-6">
        <ProcessedHistory processedRequests={processedRequests} />
      </div>
    </div>
  );
}
