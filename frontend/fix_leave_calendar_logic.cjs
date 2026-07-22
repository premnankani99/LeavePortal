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

// 3. Make cards clickable with Link
const originalCardStart = `<div key={req.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 flex flex-col justify-between">`;
const newCardStart = `<Link to={\`/admin/employees/\${req.employee_id}\`} key={req.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 flex flex-col justify-between hover:border-[#7e57c2] cursor-pointer">`;

content = content.replace(originalCardStart, newCardStart);

// To replace the closing div, we find the last </div> before ))}
const closingDivTarget = `              }
            </div>
          ))}
        </div>`;
const closingLinkTarget = `              }
            </Link>
          ))}
        </div>`;

// Fallback for half-day block end
const halfDayClosingDiv = `                )}
              </div>
            ))}
          </div>`;
const halfDayClosingLink = `                )}
              </Link>
            ))}
          </div>`;

if (content.includes(halfDayClosingDiv)) {
    content = content.replace(halfDayClosingDiv, halfDayClosingLink);
} else {
    // If exact spacing differs, use regex
    content = content.replace(/<\/div>\s*\}\)\}\s*<\/div>/, '</Link>\n          ))}\n        </div>');
}


fs.writeFileSync('src/pages/LeaveCalendar.jsx', content, 'utf8');
console.log('Fixed LeaveCalendar duplicates and links');
