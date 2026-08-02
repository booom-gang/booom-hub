import { format, formatDistanceToNow, startOfMonth, endOfMonth, isToday, isYesterday, isSameDay } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatTime = (date) => {
  return format(new Date(date), 'h:mm a');
};

export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatMonthYear = (date) => {
  return format(new Date(date), 'MMMM yyyy');
};

export const getMonthRange = (year, month) => {
  const date = new Date(year, month - 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

export const formatChatDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
};

export const formatChatTimestamp = (date) => {
  return format(new Date(date), 'h:mm a');
};

export const isDifferentDay = (date1, date2) => {
  return !isSameDay(new Date(date1), new Date(date2));
};
