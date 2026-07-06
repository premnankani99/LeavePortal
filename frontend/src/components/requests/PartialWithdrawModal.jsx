import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

export default function PartialWithdrawModal({ leave, onClose, onConfirm, isProcessing }) {
  const [dates, setDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    if (!leave) return;
    const start = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    
    // Parse already withdrawn dates if any
    let alreadyWithdrawn = [];
    if (leave.withdrawn_dates) {
      if (typeof leave.withdrawn_dates === 'string') {
        alreadyWithdrawn = JSON.parse(leave.withdrawn_dates);
      } else if (Array.isArray(leave.withdrawn_dates)) {
        alreadyWithdrawn = leave.withdrawn_dates;
      }
    }

    const current = new Date(start);
    const generatedDates = [];
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      const dateStr = current.toISOString().split('T')[0];
      
      // Determine if locked
      const isWithdrawn = alreadyWithdrawn.includes(dateStr);
      let isLocked = isWithdrawn;

      // 10 AM rule check
      if (!isLocked) {
        const now = new Date();
        const dateObj = new Date(dateStr);
        // If today is the date, check if past 10 AM
        if (now.toDateString() === dateObj.toDateString()) {
          if (now.getHours() >= 10) {
            isLocked = true;
          }
        } else if (now > dateObj) {
          // It's in the past
          isLocked = true;
        }
      }

      generatedDates.push({
        dateStr,
        display: current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isLocked,
        isWithdrawn
      });

      current.setDate(current.getDate() + 1);
    }
    setDates(generatedDates);
  }, [leave]);

  const handleToggle = (dateStr) => {
    setSelectedDates(prev => 
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleWithdraw = () => {
    // If all unlocked days are selected, it's a full withdrawal
    // Otherwise partial
    onConfirm(selectedDates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-bold text-lg text-gray-900">Withdraw Leave</h2>
            <p className="text-sm text-gray-500 mt-0.5">Select specific days to cancel</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              You can only withdraw days before <strong>10:00 AM</strong> on that specific date. Days past this deadline are locked.
            </p>
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
            {dates.map((d) => (
              <label 
                key={d.dateStr} 
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  d.isWithdrawn ? 'bg-gray-50 border-gray-100 opacity-60' :
                  d.isLocked ? 'bg-gray-50/50 border-gray-200 cursor-not-allowed opacity-75' :
                  selectedDates.includes(d.dateStr) ? 'bg-red-50 border-red-200' :
                  'bg-white border-gray-200 hover:border-red-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 disabled:opacity-50"
                    disabled={d.isLocked || d.isWithdrawn}
                    checked={d.isWithdrawn || selectedDates.includes(d.dateStr)}
                    onChange={() => handleToggle(d.dateStr)}
                  />
                  <span className={`font-medium text-sm ${
                    d.isWithdrawn || d.isLocked ? 'text-gray-500' : 'text-gray-900'
                  }`}>
                    {d.display}
                  </span>
                </div>
                {d.isWithdrawn && <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Withdrawn</span>}
                {!d.isWithdrawn && d.isLocked && <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Locked</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white" 
            disabled={selectedDates.length === 0 || isProcessing}
            onClick={handleWithdraw}
          >
            {isProcessing ? 'Processing...' : `Withdraw Selected (${selectedDates.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
