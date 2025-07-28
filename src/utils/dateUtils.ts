interface DueDateInfo {
  text: string;
  type: 'overdue' | 'today' | 'upcoming';
  color: string;
}

export function getDueDateInfo(date: string | null | undefined): DueDateInfo | null {
  if (!date) return null;

  const dueDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`,
      type: 'overdue',
      color: '#d32f2f'
    };
  } else if (diffDays === 0) {
    return {
      text: 'Due today',
      type: 'today',
      color: '#1976d2'
    };
  } else {
    return {
      text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
      type: 'upcoming',
      color: 'rgba(0, 0, 0, 0.6)'
    };
  }
} 