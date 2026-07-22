const fs = require('fs');

let content = fs.readFileSync('src/pages/LeaveCalendar.jsx', 'utf8');

// 1. Add import for Link
if (!content.includes("import { Link } from 'react-router-dom';")) {
    content = content.replace(
        "import { ChevronLeft, ChevronRight, Calendar, UserX } from 'lucide-react';",
        "import { ChevronLeft, ChevronRight, Calendar, UserX } from 'lucide-react';\nimport { Link } from 'react-router-dom';"
    );
}

// 2. Modify absentEmployees logic to deduplicate
const originalLogic = `    return approved.filter(req => {
      const start = dayjs(req.start_date).startOf('day');
      const end = dayjs(req.end_date).endOf('day');
      const current = selectedDate.startOf('day');

      if (current.isBetween(start, end, 'day', '[]')) {
        // Check for partial withdrawals
        if (req.withdrawn_dates) {
          const withdrawnArray = typeof req.withdrawn_dates === 'string' 
            ? JSON.parse(req.withdrawn_dates) 
            : req.withdrawn_dates;
          
          if (Array.isArray(withdrawnArray)) {
            const isWithdrawnToday = withdrawnArray.some(d => dayjs(d).isSame(current, 'day'));
            if (isWithdrawnToday) return false;
          }
        }
        return true;
      }
      return false;
    });`;

const newLogic = `    const filteredLeaves = approved.filter(req => {
      const start = dayjs(req.start_date).startOf('day');
      const end = dayjs(req.end_date).endOf('day');
      const current = selectedDate.startOf('day');

      if (current.isBetween(start, end, 'day', '[]')) {
        // Check for partial withdrawals
        if (req.withdrawn_dates) {
          const withdrawnArray = typeof req.withdrawn_dates === 'string' 
            ? JSON.parse(req.withdrawn_dates) 
            : req.withdrawn_dates;
          
          if (Array.isArray(withdrawnArray)) {
            const isWithdrawnToday = withdrawnArray.some(d => dayjs(d).isSame(current, 'day'));
            if (isWithdrawnToday) return false;
          }
        }
        return true;
      }
      return false;
    });

    // Deduplicate by employee_id so the same person doesn't show up twice
    const uniqueEmployees = [];
    const seenIds = new Set();
    for (const req of filteredLeaves) {
      if (!seenIds.has(req.employee_id)) {
        seenIds.add(req.employee_id);
        uniqueEmployees.push(req);
      }
    }
    return uniqueEmployees;`;

content = content.replace(originalLogic, newLogic);

// 3. Make cards clickable with Link - line by line to be safe
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<div key={req.id} className="bg-white border border-gray-100 shadow-sm')) {
        lines[i] = lines[i].replace('<div', '<Link to={`/admin/employees/${req.employee_id}`}').replace('">', ' hover:border-[#7e57c2] cursor-pointer">');
    }
}

// Find the map end and replace the previous </div> with </Link>
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('))}')) {
        for (let j = i - 1; j >= 0; j--) {
            if (lines[j].includes('</div>')) {
                lines[j] = lines[j].replace('</div>', '</Link>');
                break;
            }
        }
        break;
    }
}

fs.writeFileSync('src/pages/LeaveCalendar.jsx', lines.join('\n'), 'utf8');
console.log('Fixed LeaveCalendar.jsx reliably');
