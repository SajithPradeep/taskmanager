import { useState, useMemo } from 'react'
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Flag as FlagIcon,
  RocketLaunch as RocketLaunchIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  FamilyRestroom as FamilyRestroomIcon
} from '@mui/icons-material'
import {
  Task,
  TaskHistory,
  supabase,
  taskStatusColors,
  TaskStatus
} from '../config/supabase'
import { getDueDateInfo } from '../utils/dateUtils'
import { useAuth } from '../contexts/AuthContext';

// Helper for size icons
const sizeIcon = (size: string | undefined): JSX.Element | null => {
  if (!size) return null;
  switch (size) {
    case 'XS': return <AccessTimeIcon fontSize="small" />;
    case 'S': return <AccessTimeIcon fontSize="small" />;
    case 'M': return <CalendarTodayIcon fontSize="small" />;
    case 'L': return <FlagIcon fontSize="small" />;
    case 'XL': return <FlagIcon fontSize="small" />;
    case 'WEEK': return <CalendarTodayIcon fontSize="small" />;
    case 'MONTH': return <CalendarTodayIcon fontSize="small" />;
    case 'YEAR': return <RocketLaunchIcon fontSize="small" />;
    default: return null;
  }
};

// Helper for category icons
const categoryIcon = (category: string | undefined): JSX.Element | null => {
  if (!category) return null;
  switch (category) {
    case 'personal': return <PersonIcon fontSize="small" />;
    case 'office': return <WorkIcon fontSize="small" />;
    case 'career': return <RocketLaunchIcon fontSize="small" />;
    case 'family': return <FamilyRestroomIcon fontSize="small" />;
    default: return null;
  }
};

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
  onTaskClick: (taskId: number) => void;
}

const statusDisplayNames: Record<TaskStatus, string> = {
  'not_started': 'Not Started',
  'in_progress': 'In Progress',
  'completed': 'Completed'
};

export const TaskList = ({ tasks, onTaskUpdate, onTaskDelete, onTaskClick }: TaskListProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Group tasks by status
  const groupedTasks = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = {
      'not_started': [],
      'in_progress': [],
      'completed': []
    }
    
    tasks.forEach(task => {
      groups[task.status].push(task)
    })
    
    return groups
  }, [tasks])

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!user?.id) {
      console.error('No user ID found');
      return;
    }

    setIsDragging(false)
    
    if (!result.destination) return

    const sourceStatus = result.source.droppableId as TaskStatus
    const destinationStatus = result.destination.droppableId as TaskStatus
    const taskId = parseInt(result.draggableId)
    const task = tasks.find(t => t.id === taskId)

    if (!task || sourceStatus === destinationStatus) return

    setIsLoading(true)
    const now = new Date().toISOString()
    const updates: Partial<Task> = {
      status: destinationStatus,
      ...(destinationStatus === 'in_progress' && !task.started_at && { started_at: now }),
      ...(destinationStatus === 'completed' && { completed_at: now })
    }

    try {
      const { data: updatedTasks, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select('*')

      if (updateError) throw updateError

      const { error: historyError } = await supabase
        .from('task_history')
        .insert([{
          task_id: taskId,
          action: 'status_changed',
          previous_status: sourceStatus,
          new_status: destinationStatus,
          changed_by: user.id
        }])

      if (historyError) throw historyError

      if (updatedTasks && updatedTasks[0]) {
        onTaskUpdate(updatedTasks[0])
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    event.stopPropagation()
    setMenuAnchor(event.currentTarget)
    setSelectedTask(task)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedTask(null)
  }

  const updateTaskStatus = async (newStatus: Task['status']) => {
    if (!user?.id) {
      console.error('No user ID found');
      return;
    }

    if (!selectedTask) return
    setIsLoading(true)

    const now = new Date().toISOString()
    const updates: Partial<Task> = {
      status: newStatus,
      ...(newStatus === 'in_progress' && !selectedTask.started_at && { started_at: now }),
      ...(newStatus === 'completed' && { completed_at: now })
    }

    try {
      const { data: updatedTasks, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', selectedTask.id)
        .eq('user_id', user.id)
        .select('*')

      if (updateError) throw updateError

      const { error: historyError } = await supabase
        .from('task_history')
        .insert([{
          task_id: selectedTask.id,
          action: 'status_changed',
          previous_status: selectedTask.status,
          new_status: newStatus,
          changed_by: user.id
        }])

      if (historyError) throw historyError

      if (updatedTasks && updatedTasks[0]) {
        onTaskUpdate(updatedTasks[0])
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsLoading(false)
      handleMenuClose()
    }
  }

  const deleteTask = async (id: number) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      onTaskDelete(id)
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setIsLoading(false)
      handleMenuClose()
    }
  }

  const fetchTaskHistory = async (taskId: number) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('task_history')
        .select('*')
        .eq('task_id', taskId)
        .order('changed_at', { ascending: false })

      if (error) throw error

      if (data) {
        setTaskHistory(data)
        setIsHistoryOpen(true)
      }
    } catch (error) {
      console.error('Error fetching task history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString()
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const renderTask = (task: Task) => {
    const dueDateInfo = getDueDateInfo(task.expected_completion_date);
    const sizeChipIcon = sizeIcon(task.size);
    const categoryChipIcon = categoryIcon(task.category);
    // Determine due date color
    let dueColor = 'rgba(0,0,0,0.6)';
    if (dueDateInfo?.type === 'today') dueColor = '#1976d2';
    if (dueDateInfo?.type === 'overdue') dueColor = '#d32f2f';
    
    return (
      <ListItem
        key={task.id}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          mb: 1,
          boxShadow: 1,
          borderLeft: 4,
          borderLeftColor: taskStatusColors[task.status],
          '& .MuiListItemText-root': {
            mr: 4,
          },
          py: isMobile ? 1.2 : 1.5,
          px: isMobile ? 1 : 2,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        onClick={() => onTaskClick(task.id)}
      >
        <ListItemText
          primary={
            <Typography 
              variant={isMobile ? "body1" : "subtitle1"} 
              component="div"
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5,
                lineHeight: 1.4
              }}
            >
              {task.title}
            </Typography>
          }
          secondary={
            <Box sx={{ mt: 0 }}>
              <Stack 
                direction="row" 
                spacing={0.5} 
                flexWrap="wrap" 
                gap={0.75}
                sx={{ mb: task.description ? 1 : 0.75 }}
              >
                <Chip
                  label={task.priority}
                  size="small"
                  color={getPriorityColor(task.priority)}
                  sx={{ 
                    height: 24,
                    '& .MuiChip-label': { 
                      px: 1.2,
                      py: 0.5,
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      lineHeight: 1
                    }
                  }}
                />
                <Chip
                  {...(sizeChipIcon ? { icon: sizeChipIcon } : {})}
                  label={task.size}
                  size="small"
                  variant="filled"
                  sx={{
                    height: 22,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    color: 'white',
                    fontWeight: 600,
                    boxShadow: '0 2px 6px 0 rgba(33,203,243,.10)',
                    '& .MuiChip-label': {
                      px: 1.1,
                      py: 0.3,
                      fontSize: '0.81rem',
                      fontWeight: 600,
                      lineHeight: 1.1,
                      color: 'white',
                    },
                    '& .MuiChip-icon': {
                      color: 'white',
                      fontSize: '1.1em',
                      ml: 0.2,
                    },
                  }}
                />
                <Chip
                  {...(categoryChipIcon ? { icon: categoryChipIcon } : {})}
                  label={task.category}
                  size="small"
                  variant="filled"
                  sx={{
                    height: 22,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
                    color: 'white',
                    fontWeight: 600,
                    boxShadow: '0 2px 6px 0 rgba(254,107,139,.10)',
                    '& .MuiChip-label': {
                      px: 1.1,
                      py: 0.3,
                      fontSize: '0.81rem',
                      fontWeight: 600,
                      lineHeight: 1.1,
                      color: 'white',
                    },
                    '& .MuiChip-icon': {
                      color: 'white',
                      fontSize: '1.1em',
                      ml: 0.2,
                    },
                  }}
                />
              </Stack>
              {task.description && (
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ 
                    color: 'text.secondary',
                    mt: 0.5,
                    mb: 1,
                    fontSize: isMobile ? '0.8125rem' : '0.875rem',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {task.description}
                </Typography>
              )}
              {dueDateInfo && (
                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: dueColor,
                    fontSize: '0.8125rem',
                    mt: task.description ? 0 : 0.5
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                  {dueDateInfo.text}
                </Typography>
              )}
            </Box>
          }
        />
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            onClick={(e) => handleMenuClick(e, task)}
            size={isMobile ? "small" : "medium"}
            sx={{ color: 'text.secondary' }}
          >
            <MoreVertIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No tasks found. Try adjusting your filters or add a new task.
        </Typography>
      </Box>
    )
  }

  return (
    <>
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Stack spacing={2}>
        {(['not_started', 'in_progress', 'completed'] as TaskStatus[]).map((status) => (
          groupedTasks[status].length > 0 && (
            <Accordion
              key={status}
              defaultExpanded={status !== 'completed'}
              disableGutters
              elevation={0}
              sx={{
                bgcolor: 'background.paper',
                '&:before': {
                  display: 'none',
                },
                '& .MuiAccordionSummary-root': {
                  minHeight: 'auto',
                  padding: isMobile ? 1.75 : 2.5,
                  '&.Mui-expanded': {
                    minHeight: 'auto',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }
                },
                '& .MuiAccordionSummary-content': {
                  margin: 0,
                  '&.Mui-expanded': {
                    margin: 0
                  }
                },
                '& .MuiAccordionDetails-root': {
                  padding: isMobile ? 1.75 : 2.5,
                  paddingTop: 2
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  flexDirection: 'row-reverse',
                  '& .MuiAccordionSummary-expandIconWrapper': {
                    marginRight: 1
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Typography
                    variant={isMobile ? "subtitle1" : "h6"}
                    sx={{
                      color: taskStatusColors[status],
                      fontWeight: 600,
                      letterSpacing: '0.01em'
                    }}
                  >
                    {statusDisplayNames[status]}
                  </Typography>
                  <Chip
                    label={groupedTasks[status].length}
                    size="small"
                    sx={{ 
                      bgcolor: taskStatusColors[status], 
                      color: 'white',
                      height: 22,
                      '& .MuiChip-label': { 
                        px: 1.2,
                        fontSize: '0.8125rem',
                        fontWeight: 500
                      }
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List disablePadding>
                  {groupedTasks[status].map(renderTask)}
                </List>
              </AccordionDetails>
            </Accordion>
          )
        ))}
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            '& .MuiMenuItem-root': {
              fontSize: '0.875rem',
              py: 1
            }
          }
        }}
      >
        {isMobile && (
          <MenuItem 
            onClick={() => {
              fetchTaskHistory(selectedTask?.id || 0)
              handleMenuClose()
            }}
          >
            View History
          </MenuItem>
        )}
        <MenuItem onClick={() => updateTaskStatus('not_started')}>
          Mark as Not Started
        </MenuItem>
        <MenuItem onClick={() => updateTaskStatus('in_progress')}>
          Mark as In Progress
        </MenuItem>
        <MenuItem onClick={() => updateTaskStatus('completed')}>
          Mark as Completed
        </MenuItem>
        <MenuItem onClick={() => selectedTask && deleteTask(selectedTask.id)}>
          Delete Task
        </MenuItem>
      </Menu>

      <Dialog
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Task History</DialogTitle>
        <DialogContent>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Status Changes</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {taskHistory.map((history) => (
                  <ListItem key={history.id}>
                    <ListItemText
                      primary={
                        history.action === 'created'
                          ? 'Task Created'
                          : `Status changed from ${history.previous_status ? statusDisplayNames[history.previous_status] : 'none'} to ${history.new_status ? statusDisplayNames[history.new_status] : ''}`
                      }
                      secondary={formatDate(history.changed_at)}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
      </Dialog>
    </>
  );
}