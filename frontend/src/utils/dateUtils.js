/**
 * Checks if a date is a weekend (Sat/Sun) or public holiday
 */
export const isNonWorkingDay = (dateStr, holidaysList = []) => {
    console.log("[Frontend Component] Rendering isNonWorkingDay in dateUtils.js");
  const date = new Date(dateStr);
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6; // 0=Sun, 6=Sat
  const isHoliday = holidaysList.includes(dateStr);
  return isWeekend || isHoliday;
};

/**
 * Calculate breakdown for multiple selected dates
 * @param {Array} selectedDates - Selected dates array
 * @param {number} availablePaidLeaves - Number of paid leaves available
 * @param {boolean} isHalfDay - Whether it's a half day request
 * @param {Array} holidaysList - Array of holiday date strings (e.g., ['2026-01-26'])
 */
export const calculateMultiDateBreakdown = (selectedDates, availablePaidLeaves, isHalfDay = false, holidaysList = []) => {
    console.log("[Frontend Component] Rendering calculateMultiDateBreakdown in dateUtils.js");
  let totalWorkingDays = 0;

  selectedDates.forEach(dateObj => {
    let dateStr = "";
    if (typeof dateObj === 'string') {
      dateStr = dateObj;
    } else if (dateObj instanceof Date) {
      dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    } else if (dateObj && typeof dateObj.format === 'function') {
      dateStr = dateObj.format("YYYY-MM-DD");
    } else {
      dateStr = `${dateObj.year}-${String(dateObj.month.number).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`;
    }

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidaysList.includes(dateStr);

    if (!isWeekend && !isHoliday) {
      // If it's a half day, add 0.5 instead of 1
      totalWorkingDays += isHalfDay ? 0.5 : 1;
    }
  });

  let paidLeavesUsed = 0;
  let unpaidLeaves = 0;

  if (totalWorkingDays <= availablePaidLeaves) {
    paidLeavesUsed = totalWorkingDays;
    unpaidLeaves = 0;
  } else {
    paidLeavesUsed = availablePaidLeaves;
    unpaidLeaves = totalWorkingDays - availablePaidLeaves;
  }

  return { totalWorkingDays, paidLeavesUsed, unpaidLeaves };
};

/**
 * Format date range grouping contiguous active days and comma-separating disjoint ranges.
 * e.g., "Jul 14 - Jul 15, Jul 17"
 */
export const formatActiveDateRanges = (startDate, endDate, withdrawnDatesStr) => {
    console.log("[Frontend Component] Rendering formatActiveDateRanges in dateUtils.js");
  let withdrawn = [];
  if (withdrawnDatesStr) {
    if (typeof withdrawnDatesStr === 'string') {
      try { withdrawn = JSON.parse(withdrawnDatesStr); } catch(e){}
    } else if (Array.isArray(withdrawnDatesStr)) {
      withdrawn = withdrawnDatesStr;
    }
  }

  let workingDays = [];
  let curr = new Date(startDate);
  const finalDate = new Date(endDate);

  while (curr <= finalDate) {
    const dayOfWeek = curr.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // skip weekends
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      const isoDate = `${yyyy}-${mm}-${dd}`;
      workingDays.push({ dateObj: new Date(curr), isoDate });
    }
    curr.setDate(curr.getDate() + 1);
  }

  const formatOpts = { month: 'short', day: 'numeric' };

  if (workingDays.length === 0) {
    // all weekends? Just fallback to standard
    const s = new Date(startDate);
    const e = new Date(endDate);
    return `${s.toLocaleDateString('en-US', formatOpts)}${startDate !== endDate ? ` - ${e.toLocaleDateString('en-US', formatOpts)}` : ''}`;
  }

  // filter out withdrawn from workingDays
  const activeWorkingDays = workingDays.map((wd, index) => ({...wd, index}))
                            .filter(wd => !withdrawn.includes(wd.isoDate));

  if (activeWorkingDays.length === 0) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    return `${s.toLocaleDateString('en-US', formatOpts)}${startDate !== endDate ? ` - ${e.toLocaleDateString('en-US', formatOpts)}` : ''}`;
  }

  const groups = [];
  let currentGroup = [activeWorkingDays[0]];

  for (let i = 1; i < activeWorkingDays.length; i++) {
    const prev = activeWorkingDays[i - 1];
    const currItem = activeWorkingDays[i];
    
    // Check if consecutive in terms of working days (indices differ by exactly 1)
    if (currItem.index - prev.index === 1) {
      currentGroup.push(currItem);
    } else {
      groups.push(currentGroup);
      currentGroup = [currItem];
    }
  }
  groups.push(currentGroup);

  const formattedGroups = groups.map(group => {
    if (group.length === 1) {
      return group[0].dateObj.toLocaleDateString('en-US', formatOpts);
    } else {
      const start = group[0].dateObj.toLocaleDateString('en-US', formatOpts);
      const end = group[group.length - 1].dateObj.toLocaleDateString('en-US', formatOpts);
      return `${start} - ${end}`;
    }
  });

  return formattedGroups.join(', ');
};

/**
 * Original range-based breakdown
 */
export const calculateLeaveBreakdown = (startDate, endDate, availablePaidLeaves, holidaysList = []) => {
    console.log("[Frontend Component] Rendering calculateLeaveBreakdown in dateUtils.js");
  let totalWorkingDays = 0;
  let currentDate = new Date(startDate);
  const finalDate = new Date(endDate);

  while (currentDate <= finalDate) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateString = currentDate.toISOString().split('T')[0];
    const isHoliday = holidaysList.includes(dateString);

    if (!isWeekend && !isHoliday) {
      totalWorkingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  let paidLeavesUsed = 0;
  let unpaidLeaves = 0;

  if (totalWorkingDays <= availablePaidLeaves) {
    paidLeavesUsed = totalWorkingDays;
    unpaidLeaves = 0;
  } else {
    paidLeavesUsed = availablePaidLeaves;
    unpaidLeaves = totalWorkingDays - availablePaidLeaves;
  }

  return { totalWorkingDays, paidLeavesUsed, unpaidLeaves };
};
