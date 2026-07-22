const fs = require('fs');

let useAdminApplyLeave = fs.readFileSync('src/hooks/useAdminApplyLeave.js', 'utf8');
useAdminApplyLeave = useAdminApplyLeave.replace(
    `    available_leaves: employeeData?.available_leaves || 0,
    selectedEmployeeId,`,
    `    available_leaves: employeeData?.available_leaves || 0,
    employeeData,
    selectedEmployeeId,`
);
fs.writeFileSync('src/hooks/useAdminApplyLeave.js', useAdminApplyLeave);

let adminApplyLeaveForm = fs.readFileSync('src/components/admin/AdminApplyLeaveForm.jsx', 'utf8');
adminApplyLeaveForm = adminApplyLeaveForm.replace(
    `    available_leaves,
    selectedEmployeeId,`,
    `    available_leaves,
    employeeData,
    selectedEmployeeId,`
);
fs.writeFileSync('src/components/admin/AdminApplyLeaveForm.jsx', adminApplyLeaveForm);

console.log('Fixed apply leave form!');
