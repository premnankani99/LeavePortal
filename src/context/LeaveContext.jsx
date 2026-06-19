import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export const LeaveContext = createContext();

export const LeaveProvider = ({ children }) => {
  const { user } = useAuth() || {};

  const [leaveRequests, setLeaveRequests] = useState([]);

  // 1. Fetch Leaves from Supabase
  const fetchLeaves = async () => {
    const { data, error } = await supabase
      .from('leaves')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setLeaveRequests(data);
    if (error) console.error("Error fetching leaves:", error);
  };



  // 2. Insert new leave to Supabase
  const addLeaveRequest = async (request) => {
    // Database format map
    const dbRequest = {
      employee_name: user?.user_metadata?.full_name || user?.email || 'Unknown',
      employee_email: user?.email || 'Unknown',
      leave_type: request.leaveType,
      reason: request.reason,
      dates: request.selectedDates,
      breakdown: request.breakdown,
      status: 'Pending Approval',
      manager_status: 'Pending',
      hr_status: 'Pending'
    };

    const { data, error } = await supabase.from('leaves').insert([dbRequest]).select();
    
    if (error) {
      console.error("Error saving to database: " + error.message);
    } else if (data) {
      setLeaveRequests([data[0], ...leaveRequests]);
    }
  };

  // 3. Update Leave Status in Supabase
  const updateLeaveStatus = async (id, newStatus, level, comment = null) => {
    const payload = {
      status: newStatus
    };

    if (comment) {
      payload.admin_comment = comment;
    }

    const { error } = await supabase
      .from('leaves')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error("Error updating status: " + error.message);
    } else {
      fetchLeaves();
    }
  };

  // 4. Admin - Fetch Employee Verifications (Both Pending and Verified)
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [verifiedEmployees, setVerifiedEmployees] = useState([]);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employee_verifications')
      .select('*');
    if (data) {
      setPendingVerifications(data.filter(emp => !emp.is_verified));
      setVerifiedEmployees(data.filter(emp => emp.is_verified));
    }
  };

  // 5. Admin - Verify Employee
  const verifyEmployee = async (email) => {
    const { error } = await supabase
      .from('employee_verifications')
      .update({ is_verified: true })
      .eq('email', email);
    if (!error) {
      fetchEmployees();
      console.log("Employee verified successfully!");
    } else {
      console.error("Error verifying employee: " + error.message);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  return (
    <LeaveContext.Provider value={{ 
      leaveRequests, addLeaveRequest, updateLeaveStatus, 
      pendingVerifications, verifiedEmployees, verifyEmployee 
    }}>
      {children}
    </LeaveContext.Provider>
  );
};
