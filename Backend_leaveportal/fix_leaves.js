const fs = require('fs');

const path = 'c:\\projects\\LeavePortal\\Backend_leaveportal\\controllers\\leaves.ts';
let code = fs.readFileSync(path, 'utf8');

// The replace tool accidentally deleted handlePendingOrApprovedWithdrawal and corrupted the JSDoc for sendWithdrawalEmail.
// First, let's remove the broken JSDoc if it exists and insert our new function + the fixed JSDoc.

const brokenIndex = code.indexOf(' * @param {Date} end - End date.');
if (brokenIndex !== -1) {
    // Find the start of the JSDoc block (which might just be the remnant of it)
    let startIndex = code.lastIndexOf('/**', brokenIndex);
    if (startIndex === -1) startIndex = brokenIndex; // fallback

    const newCode = code.substring(0, startIndex) + 
`/**
 * Generates withdrawal message and update payload.
 * @param {any} leave - Leave object.
 * @param {any} datesToWithdraw - Array of dates to withdraw.
 * @returns {any} Payload with message and updateData.
 */
const handlePendingOrApprovedWithdrawal = (leave: any, datesToWithdraw: any): { message: string, updateData: any } => {
    let updateData: any = {};
    let message = "";
    
    let existingWithdrawn: string[] = [];
    if (leave.withdrawn_dates) {
        existingWithdrawn = typeof leave.withdrawn_dates === 'string' ? JSON.parse(leave.withdrawn_dates) : leave.withdrawn_dates;
    }

    if (datesToWithdraw && Array.isArray(datesToWithdraw) && datesToWithdraw.length > 0) {
        updateData.withdrawn_dates = Array.from(new Set([...existingWithdrawn, ...datesToWithdraw]));
    }

    if (leave.status === 'pending') {
        if (updateData.withdrawn_dates) {
            // Check if ALL dates between start and end are withdrawn
            const start = new Date(leave.start_date);
            const end = new Date(leave.end_date);
            const totalCalendarDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            
            if (updateData.withdrawn_dates.length >= totalCalendarDays) {
                updateData.status = 'cancelled';
                updateData.withdrawn_at = new Date();
                updateData.withdrawn_dates = null;
                message = "Leave Request Cancelled";
            } else {
                updateData.status = 'pending';
                
                // Subtract only the newly withdrawn working days
                let daysToSubtract = 0;
                datesToWithdraw.forEach((d: string) => {
                    const dateObj = new Date(d);
                    const day = dateObj.getDay();
                    if (day !== 0 && day !== 6) {
                        daysToSubtract += leave.is_half_day ? 0.5 : 1;
                    }
                });
                
                updateData.total_days = Math.max(0, leave.total_days - daysToSubtract);
                message = "Partial leave withdrawn instantly as it was still pending.";
            }
        } else {
            updateData.status = 'cancelled';
            updateData.withdrawn_at = new Date();
            message = "Leave Request Cancelled";
        }
    } else if (leave.status === 'approved') {
        updateData.status = 'withdrawal_requested';
        updateData.withdrawal_requested_at = new Date();
        message = updateData.withdrawn_dates ? "Partial Withdrawal Requested" : "Full Withdrawal Requested";
    }
    return { message, updateData };
};

/**
 * Sends withdrawal email to admin.
 * @param {any} employee - Employee object.
 * @param {Date} start - Start date.
` + code.substring(brokenIndex);
    fs.writeFileSync(path, newCode);
    console.log("Fixed successfully.");
} else {
    console.log("Could not find the broken JSDoc marker.");
}
