import { useMemo } from 'react';
import { HOLIDAY_NAMES } from '../utils/dateUtils';

export const useHolidays = () => {
  const currentYear = new Date().getFullYear();
  
  // Convert object to array and sort by date
  const sortedHolidays = useMemo(() => {
    return Object.keys(HOLIDAY_NAMES).map(dateStr => {
      return {
        date: new Date(dateStr),
        dateStr: dateStr,
        name: HOLIDAY_NAMES[dateStr]
      };
    }).sort((a, b) => a.date - b.date);
  }, []);

  return {
    currentYear,
    sortedHolidays
  };
};
