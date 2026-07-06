import { Mail, Calendar, Briefcase, Clock, CheckCircle, Shield } from 'lucide-react';

export default function ProfileCard({ user, profile, role, joinedStr, inProbation }) {
  return (
    <div className={role === 'employee' ? "lg:col-span-2" : "w-full"}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden w-full">
        <div className="bg-gradient-to-r from-[#7e57c2] to-[#9b72e5] h-32 relative"></div>
        <div className="px-8 pb-8 relative">
          <div className="w-24 h-24 bg-white rounded-full p-1.5 absolute -top-12 left-8 border border-gray-100 shadow-sm group hover:scale-105 transition-transform duration-300 cursor-pointer">
            <div className="w-full h-full bg-[#f3f0fc] text-[#7e57c2] rounded-full flex items-center justify-center text-3xl font-bold uppercase group-hover:bg-[#7e57c2] group-hover:text-white transition-colors duration-300">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          </div>
          
          <div className="pt-16 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.full_name?.replace(/\badmin\b/i, '').trim() || 'Employee'}</h2>
              <p className="text-[#7e57c2] text-base font-medium flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4" /> {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2.5 bg-white shadow-sm border border-gray-100 text-gray-500 rounded-lg"><Mail className="w-5 h-5 text-[#7e57c2]" /></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Email Address</p>
                  <p className="text-gray-900 font-medium mt-0.5 break-all">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2.5 bg-white shadow-sm border border-gray-100 text-gray-500 rounded-lg"><Calendar className="w-5 h-5 text-[#7e57c2]" /></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Date of Joining</p>
                  <p className="text-gray-900 font-medium mt-0.5">{joinedStr}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2.5 bg-white shadow-sm border border-gray-100 text-gray-500 rounded-lg"><Briefcase className="w-5 h-5 text-[#7e57c2]" /></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Department</p>
                  <p className="text-gray-900 font-medium mt-0.5">Engineering (Default)</p>
                </div>
              </div>
              
              {role === 'employee' && (
                <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-3 bg-white shadow-sm border border-gray-100 text-gray-500 rounded-lg">
                    {inProbation ? <Clock className="w-6 h-6 text-orange-500" /> : <CheckCircle className="w-6 h-6 text-green-500" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Employment Status</p>
                    <p className="text-lg text-gray-900 font-medium mt-0.5">
                      {inProbation ? <span className="text-orange-600">Probation (Under 6 Months)</span> : <span className="text-green-600">Permanent (Past Probation)</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
