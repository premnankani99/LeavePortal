const fs = require('fs');

// 1. Fix useAdminApplyLeave.js to export employeeData
let useAdminApplyLeave = fs.readFileSync('src/hooks/useAdminApplyLeave.js', 'utf8');
if (!useAdminApplyLeave.includes('employeeData,')) {
    useAdminApplyLeave = useAdminApplyLeave.replace(
        'available_leaves: employeeData?.available_leaves || 0,',
        'available_leaves: employeeData?.available_leaves || 0,\n    employeeData,'
    );
    fs.writeFileSync('src/hooks/useAdminApplyLeave.js', useAdminApplyLeave);
    console.log('Fixed useAdminApplyLeave.js');
}

// 2. Fix AdminApplyLeaveForm.jsx to import employeeData
let adminApplyLeaveForm = fs.readFileSync('src/components/admin/AdminApplyLeaveForm.jsx', 'utf8');
if (!adminApplyLeaveForm.includes('employeeData,')) {
    adminApplyLeaveForm = adminApplyLeaveForm.replace(
        'available_leaves,',
        'available_leaves,\n    employeeData,'
    );
    fs.writeFileSync('src/components/admin/AdminApplyLeaveForm.jsx', adminApplyLeaveForm);
    console.log('Fixed AdminApplyLeaveForm.jsx');
}

// 3. Fix useAdminCreateRequestOnBehalf in useLeaves.js to map leave_type
let useLeaves = fs.readFileSync('src/hooks/useLeaves.js', 'utf8');
if (!useLeaves.includes('leave_type: requestData.leave_type_id ||')) {
    useLeaves = useLeaves.replace(
        'body: JSON.stringify(requestData)',
        'body: JSON.stringify({ ...requestData, leave_type: requestData.leave_type_id || "Casual Leave" })'
    );
    fs.writeFileSync('src/hooks/useLeaves.js', useLeaves);
    console.log('Fixed useLeaves.js mapping');
}

// 4. Fix LeaveDatePicker.jsx to allow previous month
let leaveDatePicker = fs.readFileSync('src/components/leave-form/LeaveDatePicker.jsx', 'utf8');
if (!leaveDatePicker.includes('prevMonthDate')) {
    leaveDatePicker = leaveDatePicker.replace(
        'const maxDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);',
        'const maxDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);\n    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);'
    );
    leaveDatePicker = leaveDatePicker.replace(
        'minDate={allowPastDates ? undefined : new Date()}',
        'minDate={allowPastDates ? prevMonthDate : new Date()}'
    );
    fs.writeFileSync('src/components/leave-form/LeaveDatePicker.jsx', leaveDatePicker);
    console.log('Fixed LeaveDatePicker.jsx max/min dates');
}
