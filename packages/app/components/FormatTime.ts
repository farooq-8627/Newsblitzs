import { format, differenceInMinutes, differenceInHours, isToday, parseISO } from 'date-fns';

export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const updatedAt = parseISO(dateString);

  const diffInMinutes = differenceInMinutes(now, updatedAt);
  const diffInHours = differenceInHours(now, updatedAt);

  if (diffInMinutes < 1) {
    return 'Just now  •  ' + format(updatedAt, 'h:mm a  dd-MM-yyyy');
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago  •  ${format(updatedAt, 'h:mm a  dd-MM-yyyy')}`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago  •  ${format(updatedAt, 'h:mm a  dd-MM-yyyy')}`;
  } else {
    // For dates older than 24 hours, only show the date and time
    return format(updatedAt, 'h:mm a dd-MM-yyyy'); // e.g., 12:44 PM 15-12-2024
  }
};
