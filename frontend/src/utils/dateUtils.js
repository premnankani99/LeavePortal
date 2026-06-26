// Rajasthan holidays temporarily removed
// Add them back later when needed
export const COMPANY_HOLIDAYS = [];
export const HOLIDAY_NAMES = {};

/**
 * Checks if a date is a weekend (Sat/Sun) or public holiday
 */
export const isNonWorkingDay = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6; // 0=Sun, 6=Sat
  const isHoliday = COMPANY_HOLIDAYS.includes(dateStr);
  return isWeekend || isHoliday;
};

/**
 * Calculate breakdown for multiple selected dates
 * @param {Array} selectedDates - Selected dates array
 * @param {number} availablePaidLeaves - Number of paid leaves available
 * @param {boolean} isHalfDay - Whether it's a half day request
 * @param {boolean} isCompensatory - Whether the employee will compensate the half day
 */
export const calculateMultiDateBreakdown = (selectedDates, availablePaidLeaves, isHalfDay = false, isCompensatory = false) => {
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
    const isHoliday = COMPANY_HOLIDAYS.includes(dateStr);

    if (!isWeekend && !isHoliday) {
      // If it's a half day, add 0.5 instead of 1
      totalWorkingDays += isHalfDay ? 0.5 : 1;
    }
  });

  // If compensatory is selected for a half day, there is no leave deducted (0 days)
  if (isHalfDay && isCompensatory) {
    totalWorkingDays = 0;
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

/**
 * Original range-based breakdown
 */
export const calculateLeaveBreakdown = (startDate, endDate, availablePaidLeaves) => {
  let totalWorkingDays = 0;
  let currentDate = new Date(startDate);
  const finalDate = new Date(endDate);

  while (currentDate <= finalDate) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateString = currentDate.toISOString().split('T')[0];
    const isHoliday = COMPANY_HOLIDAYS.includes(dateString);

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
