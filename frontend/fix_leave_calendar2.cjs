const fs = require('fs');

let leaveCalendar = fs.readFileSync('src/pages/LeaveCalendar.jsx', 'utf8');

// Replace closing div with Link
leaveCalendar = leaveCalendar.replace(
    '                )}\r\n              </div>\r\n            ))}',
    '                )}\r\n              </Link>\r\n            ))}'
);

leaveCalendar = leaveCalendar.replace(
    '                )}\n              </div>\n            ))}',
    '                )}\n              </Link>\n            ))}'
);

fs.writeFileSync('src/pages/LeaveCalendar.jsx', leaveCalendar);
console.log('Fixed LeaveCalendar.jsx closing tag');
