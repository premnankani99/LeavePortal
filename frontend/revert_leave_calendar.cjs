const fs = require('fs');

let content = fs.readFileSync('src/pages/LeaveCalendar.jsx', 'utf8');

// Revert Link back to div
content = content.replace(/<Link to=\{`\/admin\/employees\/\$\{req\.employee_id\}`\} key=\{req\.id\} className="([^"]+)">/g, function(match, className) {
    // Remove the Link specific classes we added
    let newClass = className.replace(' block hover:border-[#7e57c2] cursor-pointer', '');
    newClass = newClass.replace(' hover:border-[#7e57c2] cursor-pointer', '');
    return `<div key={req.id} className="${newClass}">`;
});

content = content.replace(/<\/Link>/g, '</div>');

// Also remove the import Link
content = content.replace("import { Link } from 'react-router-dom';\n", "");

fs.writeFileSync('src/pages/LeaveCalendar.jsx', content, 'utf8');
console.log('Reverted LeaveCalendar.jsx to non-clickable cards');
