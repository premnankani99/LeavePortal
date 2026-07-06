import { useState } from 'react';
import { Users, Mail, Calendar, ShieldCheck, Loader2, Search, Trash2, Filter, AlertTriangle, X, Edit, Phone } from 'lucide-react';

// Replaced inline style array with Tailwind classes per requirements
const AVATAR_COLORS = [
  'bg-[#7e57c2]',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-red-500',
  'bg-purple-500'
];

export default function EmployeeTable({ filteredEmployees, isLoading, search, setSearch, department, setDepartment, onDelete, onUpdate, onRowClick, readOnly }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // For details modal
  const [employeeToEdit, setEmployeeToEdit] = useState(null); // For edit modal
  const [editFormData, setEditFormData] = useState({ full_name: '', email: '', designation: '', phone: '', date_of_joining: '' });

  const handleEditClick = (emp) => {
    setEmployeeToEdit(emp);
    setEditFormData({
      full_name: emp.full_name || '',
      email: emp.email || '',
      designation: emp.designation || '',
      phone: emp.phone || '',
      date_of_joining: emp.date_of_joining ? new Date(emp.date_of_joining).toISOString().split('T')[0] : (emp.created_at ? new Date(emp.created_at).toISOString().split('T')[0] : '')
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (onUpdate && employeeToEdit) {
      await onUpdate({ id: employeeToEdit.id, data: editFormData });
      setEmployeeToEdit(null);
    }
  };

  const handleDeleteClick = (emp) => {
    setEmployeeToDelete(emp);
    setShowConfirmModal(true);
  };

  const confirmDeletion = () => {
    if (employeeToDelete && onDelete) {
      onDelete(employeeToDelete.id);
      setEmployeeToDelete(null);
      setShowConfirmModal(false);
    }
  };
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#9b72e5] w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden min-h-[400px]">
      
      <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between gap-4 items-center">
        
        {/* Left Side: Search */}
        <div className="relative w-full flex-1 max-w-2xl">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#9b72e5] focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>

        {/* Right Side: Delete & Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-56">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 appearance-none border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#9b72e5] focus:border-transparent outline-none transition-all shadow-sm bg-white"
            >
              <option value="All">All Departments</option>
              <option value="Appian Developer">Appian Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#9b72e5]" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No employees found</p>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              {search ? 'Try adjusting your search query.' : 'There are no verified employees yet.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-base text-left">
          <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-4 font-semibold text-gray-600 uppercase tracking-wide text-sm">Employee</th>
              <th className="px-4 py-4 font-semibold text-gray-600 uppercase tracking-wide text-sm">Contact</th>
              <th className="px-4 py-4 font-semibold text-gray-600 uppercase tracking-wide text-sm">Department</th>
              <th className="px-4 py-4 font-semibold text-gray-600 uppercase tracking-wide text-sm">Joined Date</th>
              <th className="px-4 py-4 font-semibold text-gray-600 uppercase tracking-wide text-sm text-center">Leave Balance</th>
              <th className="px-4 py-4 font-semibold text-gray-600 uppercase tracking-wide text-sm">Status</th>
              {!readOnly && <th className="px-4 py-4 font-semibold text-gray-600 uppercase tracking-wide text-sm text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredEmployees.map((emp, i) => (
              <tr key={emp.id} className="hover:bg-purple-50/50 transition-colors group">
                <td className="px-4 py-4">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onRowClick ? onRowClick(emp) : setSelectedEmployee(emp)}
                    title="Click to view details"
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-110 transition-transform duration-300 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                    >
                      {(emp.full_name || emp.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-base group-hover:text-[#7e57c2] transition-colors truncate">{emp.full_name || 'No Name'}</p>
                      <p className="text-xs text-gray-500 hover:underline cursor-pointer">View details</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
                    {emp.designation || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-500 text-sm whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(emp.date_of_joining || emp.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </td>
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-[#7e57c2] border border-purple-200 shadow-sm">
                    {emp.available_leaves ?? 0} Days
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-4 h-4" /> Verified
                  </span>
                </td>
                {!readOnly && (
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 transition-opacity">
                      <button
                        onClick={() => handleEditClick(emp)}
                        className="p-2 text-gray-400 hover:text-[#7e57c2] hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Employee"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(emp)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Employee"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Remove Employee(s)</h3>
                    <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                <p className="text-gray-700 text-sm">
                  Are you sure you want to permanently remove <span className="font-bold text-gray-900">{employeeToDelete?.full_name}</span> from the directory? All their associated data, including leave history, will be deleted.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletion}
                  className="px-5 py-2.5 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors text-sm flex items-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 relative">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center mt-2 mb-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-4 bg-[#7e57c2]">
                  {(selectedEmployee.full_name || selectedEmployee.email).charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.full_name || 'No Name'}</h3>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium mt-2">{selectedEmployee.designation || 'N/A'}</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-sm font-medium">{selectedEmployee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-sm font-medium">{selectedEmployee.phone || 'Phone number not provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-sm font-medium">Joined {new Date(selectedEmployee.date_of_joining || selectedEmployee.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-emerald-700 capitalize">Status: {selectedEmployee.verification_status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {employeeToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <Edit className="w-5 h-5 text-[#7e57c2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Edit Employee</h3>
                    <p className="text-sm text-gray-500 mt-1">Update profile details below.</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setEmployeeToEdit(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={editFormData.full_name} 
                    onChange={e => setEditFormData({...editFormData, full_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={editFormData.email} 
                    onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department / Designation</label>
                  <select 
                    value={editFormData.designation} 
                    onChange={e => setEditFormData({...editFormData, designation: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow bg-white"
                  >
                    <option value="">Select Department</option>
                    <option value="Appian Developer">Appian Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={editFormData.phone} 
                    onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                  <input 
                    type="date" 
                    value={editFormData.date_of_joining} 
                    onChange={e => setEditFormData({...editFormData, date_of_joining: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEmployeeToEdit(null)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-medium bg-purple-500 hover:bg-[#7e57c2] text-white transition-colors text-sm flex items-center gap-2 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
