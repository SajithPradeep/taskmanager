import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { 
  Fab, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Menu, 
  MenuItem,
  Stack,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SortIcon from '@mui/icons-material/Sort';
import SettingsIcon from '@mui/icons-material/Settings';
import FilterListIcon from '@mui/icons-material/FilterList';
import CancelIcon from '@mui/icons-material/Cancel';
import { TaskList } from '../components/TaskList';
import { AddTaskForm } from '../components/AddTaskForm';
import { TaskFilterDropdown } from '../components/TaskFilterDropdown';
import { Task, TaskFilters, supabase } from '../config/supabase';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

type SortDirection = 'asc' | 'desc' | null;

export const TaskListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortChange = (direction: SortDirection) => {
    setSortDirection(direction);
    handleSortClose();
    
    const sorted = [...filteredTasks].sort((a, b) => {
      if (!a.expected_completion_date || !b.expected_completion_date) {
        return !a.expected_completion_date ? 1 : -1;
      }
      const dateA = new Date(a.expected_completion_date);
      const dateB = new Date(b.expected_completion_date);
      return direction === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
    setFilteredTasks(sorted);
  };

  const applyFilters = useCallback((taskList: Task[], filters: TaskFilters) => {
    let filtered = [...taskList];

    if (filters.priority?.length) {
      filtered = filtered.filter(task => task.priority && filters.priority!.includes(task.priority));
    }

    if (filters.size?.length) {
      filtered = filtered.filter(task => task.size && filters.size!.includes(task.size));
    }

    if (filters.category?.length) {
      filtered = filtered.filter(task => task.category && filters.category!.includes(task.category));
    }

    if (filters.timeFrame?.length) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(task => {
        if (!task.expected_completion_date) return false;
        const taskDate = new Date(task.expected_completion_date);
        
        return filters.timeFrame!.some((frame: 'today' | 'week' | 'month') => {
          switch (frame) {
            case 'today':
              return taskDate >= today && taskDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
            case 'week':
              const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
              return taskDate >= today && taskDate <= weekEnd;
            case 'month':
              const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
              return taskDate >= today && taskDate <= monthEnd;
            default:
              return true;
          }
        });
      });
    }

    // Apply current sort if exists
    if (sortDirection) {
      filtered.sort((a, b) => {
        if (!a.expected_completion_date || !b.expected_completion_date) {
          return !a.expected_completion_date ? 1 : -1;
        }
        const dateA = new Date(a.expected_completion_date);
        const dateB = new Date(b.expected_completion_date);
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      });
    }

    setFilteredTasks(filtered);
  }, [sortDirection]);

  const handleFilterChange = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters);
    applyFilters(tasks, newFilters);
  }, [tasks, applyFilters]);

  const handleFilterRemove = (key: keyof TaskFilters, value: string) => {
    const current = (filters[key] as string[] | undefined) || [];
    const updated = current.filter(v => v !== value);
    handleFilterChange({ ...filters, [key]: updated.length ? updated : undefined });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value.length > 0);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleTaskUpdate = useCallback(async (updatedTask: Task) => {
    try {
      if (!user?.id) {
        console.error('No user ID found');
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', updatedTask.id)
        .eq('user_id', user.id) // Use the actual user.id instead of 'current_user'
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      if (data) {
        setTasks(prevTasks => {
          const newTasks = prevTasks.map(t => t.id === data.id ? data : t);
          applyFilters(newTasks, filters);
          return newTasks;
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
}, [filters, applyFilters, user]);

  const handleTaskDelete = useCallback(async (deletedTaskId: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', deletedTaskId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setTasks(prevTasks => {
        const newTasks = prevTasks.filter(t => t.id !== deletedTaskId);
        applyFilters(newTasks, filters);
        return newTasks;
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [filters, applyFilters, user]);

  const handleAddTask = useCallback(async (newTask: Omit<Task, 'id' | 'created_at' | 'user_id' | 'updated_at'>) => {
    try {
      console.log('Adding new task:', newTask);
      
      if (!user?.id) {
        console.error('No user ID found');
        return;
      }

      // Check if profile exists, if not create it
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.log('Profile not found, creating new profile...');
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            email: user.email 
          }]);

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          return;
        }
      }

      const taskToInsert = {
        ...newTask,
        user_id: user.id,
      };

      console.log('Inserting task:', taskToInsert);

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskToInsert])
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error adding task:', error);
        return;
      }

      console.log('Task added successfully:', data);

      if (data) {
        setTasks(prevTasks => {
          console.log('Updating tasks list');
          const updatedTasks = [data, ...prevTasks];
          applyFilters(updatedTasks, filters);
          return updatedTasks;
        });
        setIsAddTaskOpen(false);
      }
    } catch (error) {
      console.error('Error in handleAddTask:', error);
    }
  }, [user, filters, applyFilters]);

  const handleTaskClick = (taskId: number) => {
    navigate(`/task/${taskId}`);
  };

  const handleAddClick = () => {
    setIsAddTaskOpen(true);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setTasks(data);
          applyFilters(data, filters);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user, filters, applyFilters]);

  return (
    <Container maxWidth="md" sx={{ py: 4, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: hasActiveFilters ? 2 : 3
        }}>
          <Box sx={{
            background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            minWidth: 140
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: 'white',
                letterSpacing: '0.5px',
              }}
            >
              My Tasks
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handleFilterClick}
              sx={{ 
                bgcolor: Boolean(filterAnchorEl) ? 'primary.dark' : 'primary.main',
                color: 'white',
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <FilterListIcon />
            </IconButton>
            <IconButton
              onClick={handleSortClick}
              sx={{ 
                bgcolor: sortDirection ? 'primary.main' : 'background.paper',
                color: sortDirection ? 'white' : 'text.secondary',
                width: 40,
                height: 40,
                border: '1px solid',
                borderColor: sortDirection ? 'primary.main' : 'divider',
                '&:hover': {
                  bgcolor: sortDirection ? 'primary.dark' : 'background.paper',
                  borderColor: 'primary.main'
                }
              }}
            >
              <SortIcon />
            </IconButton>
            <IconButton
              onClick={handleSettingsClick}
              sx={{ 
                bgcolor: 'background.paper',
                color: 'text.secondary',
                width: 40,
                height: 40,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        {hasActiveFilters && (
          <Stack 
            direction="row" 
            spacing={1} 
            flexWrap="wrap" 
            sx={{ 
              mb: 3,
              gap: 1,
              '& > *': {
                margin: '0 !important'
              }
            }}
          >
            {filters.priority?.map(priority => (
              <Chip
                key={priority}
                label={priority}
                size="small"
                color="primary"
                onDelete={() => handleFilterRemove('priority', priority)}
                deleteIcon={<CancelIcon />}
              />
            ))}
            {filters.size?.map(size => (
              <Chip
                key={size}
                label={size}
                size="small"
                color="primary"
                onDelete={() => handleFilterRemove('size', size)}
                deleteIcon={<CancelIcon />}
              />
            ))}
            {filters.category?.map(category => (
              <Chip
                key={category}
                label={category}
                size="small"
                color="primary"
                onDelete={() => handleFilterRemove('category', category)}
                deleteIcon={<CancelIcon />}
              />
            ))}
            {filters.timeFrame?.map(timeFrame => (
              <Chip
                key={timeFrame}
                label={timeFrame === 'today' ? 'Today' : 
                      timeFrame === 'week' ? 'This Week' : 
                      'This Month'}
                size="small"
                color="primary"
                onDelete={() => handleFilterRemove('timeFrame', timeFrame)}
                deleteIcon={<CancelIcon />}
              />
            ))}
          </Stack>
        )}

        <TaskFilterDropdown 
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          filters={filters}
          onChange={handleFilterChange}
        />

        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={handleSortClose}
          sx={{ zIndex: 1302 }}
        >
          <MenuItem 
            onClick={() => handleSortChange('asc')}
            selected={sortDirection === 'asc'}
          >
            Due Date (Earliest First)
          </MenuItem>
          <MenuItem 
            onClick={() => handleSortChange('desc')}
            selected={sortDirection === 'desc'}
          >
            Due Date (Latest First)
          </MenuItem>
          {sortDirection && (
            <MenuItem 
              onClick={() => handleSortChange(null)}
              sx={{ color: 'error.main' }}
            >
              Clear Sort
            </MenuItem>
          )}
        </Menu>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {filteredTasks.length === 0 ? (
            <EmptyState onAddClick={handleAddClick} />
          ) : (
            <TaskList
              tasks={filteredTasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskClick={handleTaskClick}
            />
          )}
        </Box>
      </Box>
      
      <Fab
        color="primary"
        aria-label="add task"
        onClick={handleAddClick}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: { xs: 16, sm: 'auto' },
          left: { xs: 'auto', sm: '50%' },
          transform: { xs: 'none', sm: 'translateX(240px)' },
        }}
      >
        <AddIcon />
      </Fab>

      <Dialog
        open={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add New Task
          <IconButton
            aria-label="close"
            onClick={() => setIsAddTaskOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <AddTaskForm onSubmit={handleAddTask} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}; 