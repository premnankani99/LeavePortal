export const leaveAppliedAdminTemplate = (employeeName: string, totalDays: number, startDate: string, endDate: string, reason: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50;">New Leave Request</h2>
    <p>Hello Admin,</p>
    <p><strong>${employeeName}</strong> has applied for a leave. Here are the details:</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Duration:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${totalDays} day(s)</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>From:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${startDate}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>To:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${endDate}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reason:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reason}</td>
        </tr>
    </table>
    <br/>
    <p>Please log in to the Leave Portal to review this request.</p>
    <br/>
    <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
</div>
`;

export const leaveAppliedEmployeeTemplate = (employeeName: string, totalDays: number, startDate: string, endDate: string, reason: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50;">Leave Application Submitted</h2>
    <p>Dear ${employeeName},</p>
    <p>Your leave application has been successfully submitted and is pending review by the admin.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Duration:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${totalDays} day(s)</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>From:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${startDate}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>To:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${endDate}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reason:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reason}</td>
        </tr>
    </table>
    <br/>
    <p>We will notify you once a decision has been made.</p>
    <br/>
    <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
</div>
`;

export const leaveStatusUpdateTemplate = (employeeName: string, startDate: string, endDate: string, status: string, adminNote: string) => {
    const statusColor = status.toLowerCase() === 'approved' ? '#27ae60' : (status.toLowerCase() === 'rejected' ? '#c0392b' : '#f39c12');
    
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: ${statusColor};">Leave Request ${status.toUpperCase()}</h2>
        <p>Dear ${employeeName},</p>
        <p>Your leave request from <strong>${startDate}</strong> to <strong>${endDate}</strong> has been <strong style="color: ${statusColor};">${status}</strong>.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid ${statusColor}; margin-top: 15px;">
            <p style="margin: 0;"><strong>Admin Note:</strong> ${adminNote || 'No additional notes provided.'}</p>
        </div>
        <br/>
        <p>Log in to the Leave Portal for more details.</p>
        <br/>
        <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
    </div>
    `;
};

export const leaveWithdrawalAdminTemplate = (employeeName: string, startDate: string, endDate: string, message: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #f39c12;">Leave Withdrawal Request</h2>
    <p>Hello Admin,</p>
    <p><strong>${employeeName}</strong> has requested to withdraw their approved/pending leave.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>From:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${startDate}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>To:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${endDate}</td>
        </tr>
    </table>
    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #f39c12; margin-top: 15px;">
        <p style="margin: 0;"><strong>Message:</strong> ${message}</p>
    </div>
    <br/>
    <p>Please log in to the Leave Portal to review and approve the withdrawal.</p>
    <br/>
    <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
</div>
`;
