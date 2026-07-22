const fs = require('fs');

let useLeaves = fs.readFileSync('src/hooks/useLeaves.js', 'utf8');
useLeaves = useLeaves.replace(
    /body:\s*JSON\.stringify\(requestData\)/g,
    'body: JSON.stringify({ ...requestData, leave_type: requestData.leave_type_id || "Casual Leave" })'
);
fs.writeFileSync('src/hooks/useLeaves.js', useLeaves);

let useAdminApplyLeave = fs.readFileSync('src/hooks/useAdminApplyLeave.js', 'utf8');
useAdminApplyLeave = useAdminApplyLeave.replace(
    'available_leaves: employeeData?.available_leaves || 0,',
    'available_leaves: employeeData?.available_leaves || 0,\n    employeeData,'
);
fs.writeFileSync('src/hooks/useAdminApplyLeave.js', useAdminApplyLeave);

console.log('Fixed scripts');
