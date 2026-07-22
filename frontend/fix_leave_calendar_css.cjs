const fs = require('fs');
let leaveCalendar = fs.readFileSync('src/pages/LeaveCalendar.jsx', 'utf8');
leaveCalendar = leaveCalendar.replace('flex flex-col justify-between block hover:border-[#7e57c2] cursor-pointer', 'flex flex-col justify-between hover:border-[#7e57c2] cursor-pointer');
fs.writeFileSync('src/pages/LeaveCalendar.jsx', leaveCalendar);
console.log('Fixed block class');
