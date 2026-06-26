import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

export default function VerificationQueue({ 
  pendingVerifications, 
  loadingVerifications, 
  onVerify, 
  onReject, 
  isVerifying 
}) {
  return (
    <div className="flex-1 flex flex-col">
      <Card className="border-t-4 border-t-purple-500 flex-1 flex flex-col shadow-sm">

        <CardContent className="flex-1 flex flex-col overflow-auto">
          {loadingVerifications ? (
            <div className="flex-1 flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
            </div>
          ) : pendingVerifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No new employees pending verification.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {pendingVerifications.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-5 border border-gray-100 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-base uppercase shrink-0">
                      {(emp.full_name || emp.email || 'U').charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{emp.full_name || 'No Name Provided'}</h4>
                      <p className="text-sm text-gray-500">{emp.email}</p>
                      <p className="text-xs text-purple-600 font-semibold mt-1 uppercase tracking-wider">Pending Verification</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center gap-1.5"
                      onClick={() => onReject(emp.id, emp.full_name)}
                      disabled={isVerifying}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
                      onClick={() => onVerify(emp.id)}
                      disabled={isVerifying}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
