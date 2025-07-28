export const getDueDateInfo = (expectedDate: string | null) => {
  if (!expectedDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(expectedDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`,
      color: '#d32f2f', // dark red
      type: 'overdue'
    };
  } else if (diffDays === 0) {
    return {
      text: 'Due today',
      color: '#1976d2', // blue
      type: 'today'
    };
  } else {
    return {
      text: `Due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`,
      color: 'rgba(0, 0, 0, 0.6)', // grey
      type: 'upcoming'
    };
  }
}; 