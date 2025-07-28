import { useState } from 'react';
import {
  Box,
  Menu,
  MenuItem,
  Chip,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import { TaskPriority, TaskSize, TaskCategory } from '../config/supabase';

export interface TaskFilters {
  priority?: TaskPriority[];
  size?: TaskSize[];
  category?: TaskCategory[];
  timeFrame?: ('today' | 'week' | 'month')[];
}

interface TaskFilterDropdownProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];
const SIZES: TaskSize[] = ['XS', 'S', 'M', 'L', 'XL', 'WEEK', 'MONTH', 'YEAR'];
const CATEGORIES: TaskCategory[] = ['personal', 'office', 'career', 'family'];
const TIME_FRAMES: Array<{ value: 'today' | 'week' | 'month', label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' }
];

export const TaskFilterDropdown = ({ filters, onChange, anchorEl, onClose }: TaskFilterDropdownProps) => {
  const handleChipToggle = (key: keyof TaskFilters, value: any) => {
    const current = (filters[key] as string[] | undefined) || [];
    const exists = current.includes(value);
    const updated = exists ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: updated.length ? updated : undefined });
  };

  const handleClear = () => {
    onChange({});
    onClose();
  };

  return (
    <Menu 
      anchorEl={anchorEl} 
      open={Boolean(anchorEl)} 
      onClose={onClose}
      sx={{ zIndex: 1302 }}
    >
      <Box sx={{ px: 2, py: 1, minWidth: 260 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Priority</Typography>
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
          {PRIORITIES.map(priority => (
            <Chip
              key={priority}
              label={priority}
              color={filters.priority?.includes(priority) ? 'primary' : 'default'}
              onClick={() => handleChipToggle('priority', priority)}
              variant={filters.priority?.includes(priority) ? 'filled' : 'outlined'}
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Size</Typography>
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
          {SIZES.map(size => (
            <Chip
              key={size}
              label={size}
              color={filters.size?.includes(size) ? 'primary' : 'default'}
              onClick={() => handleChipToggle('size', size)}
              variant={filters.size?.includes(size) ? 'filled' : 'outlined'}
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Category</Typography>
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
          {CATEGORIES.map(category => (
            <Chip
              key={category}
              label={category}
              color={filters.category?.includes(category) ? 'primary' : 'default'}
              onClick={() => handleChipToggle('category', category)}
              variant={filters.category?.includes(category) ? 'filled' : 'outlined'}
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Time Frame</Typography>
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
          {TIME_FRAMES.map(tf => (
            <Chip
              key={tf.value}
              label={tf.label}
              color={filters.timeFrame?.includes(tf.value) ? 'primary' : 'default'}
              onClick={() => handleChipToggle('timeFrame', tf.value)}
              variant={filters.timeFrame?.includes(tf.value) ? 'filled' : 'outlined'}
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Stack>
        <MenuItem onClick={handleClear} sx={{ color: 'error.main', justifyContent: 'center', mt: 1 }}>
          Clear All Filters
        </MenuItem>
      </Box>
    </Menu>
  );
}; 