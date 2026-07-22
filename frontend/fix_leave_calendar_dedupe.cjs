const fs = require('fs');

let content = fs.readFileSync('src/pages/LeaveCalendar.jsx', 'utf8');

const regex = /const absentEmployees = useMemo\(\(\) => \{([\s\S]*?)\}, \[allRequests, selectedDate\]\);/;

const newBlock = `const absentEmployees = useMemo(() => {
    // Only approved leaves
    const approved = allRequests.filter(r => r.status === 'approved');

    const filtered = approved.filter(req => {
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
    for (const req of filtered) {
      if (!seenIds.has(req.employee_id)) {
        seenIds.add(req.employee_id);
        uniqueEmployees.push(req);
      }
    }
    return uniqueEmployees;
  }, [allRequests, selectedDate]);`;

content = content.replace(regex, newBlock);

fs.writeFileSync('src/pages/LeaveCalendar.jsx', content, 'utf8');
console.log("Successfully fixed deduplication in LeaveCalendar.jsx");
