const fs = require('fs');

let leaveCalendar = fs.readFileSync('src/pages/LeaveCalendar.jsx', 'utf8');

// Import Link if not imported
if (!leaveCalendar.includes('import { Link }')) {
    leaveCalendar = leaveCalendar.replace(
        "import { ChevronLeft, ChevronRight, Calendar, UserX } from 'lucide-react';",
        "import { ChevronLeft, ChevronRight, Calendar, UserX } from 'lucide-react';\nimport { Link } from 'react-router-dom';"
    );
}

// Replace div with Link
if (leaveCalendar.includes('<div key={req.id} className="bg-white border')) {
    leaveCalendar = leaveCalendar.replace(
        '<div key={req.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 flex flex-col justify-between">',
        '<Link to={`/admin/employees/${req.employee_id}`} key={req.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 flex flex-col justify-between block hover:border-[#7e57c2] cursor-pointer">'
    );
    leaveCalendar = leaveCalendar.replace(
        /<\/div>\s*\}\)\}\s*<\/div>/,
        '</Link>\n            ))}\n          </div>'
    );
}

fs.writeFileSync('src/pages/LeaveCalendar.jsx', leaveCalendar);
console.log('Fixed LeaveCalendar.jsx');
