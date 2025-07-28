import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Task, TaskPriority, TaskSize, TaskCategory } from '../config/supabase';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface AddTaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'user_id' | 'updated_at'>) => void | Promise<void>;
}

export const AddTaskForm = ({ onSubmit }: AddTaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [size, setSize] = useState<TaskSize>('M');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    
    try {
      setSubmitting(true);
      console.log('Form submitted with values:', {
        title,
        description,
        priority,
        size,
        category,
        dueDate
      });

      const newTask = {
        title,
        description,
        priority,
        size,
        category,
        expected_completion_date: dueDate?.toISOString(),
        status: 'not_started' as const
      };

      console.log('Submitting task:', newTask);
      await onSubmit(newTask);
      console.log('Task submitted successfully');

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setSize('M');
      setCategory('personal');
      setDueDate(null);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        fullWidth
        disabled={submitting}
      />

      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={4}
        fullWidth
        disabled={submitting}
      />

      <FormControl fullWidth disabled={submitting}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={priority}
          label="Priority"
          onChange={(e: SelectChangeEvent) => setPriority(e.target.value as TaskPriority)}
        >
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={submitting}>
        <InputLabel>Size</InputLabel>
        <Select
          value={size}
          label="Size"
          onChange={(e: SelectChangeEvent) => setSize(e.target.value as TaskSize)}
        >
          <MenuItem value="XS">XS ({"<"}10 mins)</MenuItem>
          <MenuItem value="S">S ({"<"}1 hour)</MenuItem>
          <MenuItem value="M">M (1-2 hours)</MenuItem>
          <MenuItem value="L">L (1 day)</MenuItem>
          <MenuItem value="XL">XL (Few days)</MenuItem>
          <MenuItem value="WEEK">1 Week</MenuItem>
          <MenuItem value="MONTH">1 Month</MenuItem>
          <MenuItem value="YEAR">1 Year</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={submitting}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e: SelectChangeEvent) => setCategory(e.target.value as TaskCategory)}
        >
          <MenuItem value="personal">Personal</MenuItem>
          <MenuItem value="office">Office</MenuItem>
          <MenuItem value="career">Career</MenuItem>
          <MenuItem value="family">Family</MenuItem>
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Due Date"
          value={dueDate}
          onChange={(newValue: Date | null) => setDueDate(newValue)}
          slotProps={{
            textField: {
              fullWidth: true,
              disabled: submitting
            },
          }}
        />
      </LocalizationProvider>

      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        size="large"
        disabled={submitting}
      >
        {submitting ? 'Adding Task...' : 'Add Task'}
      </Button>
    </Box>
  );
}; 