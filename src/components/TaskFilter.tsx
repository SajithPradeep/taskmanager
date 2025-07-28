import { useState } from 'react'
import {
  Box,
  Typography,
  Chip,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material'
import { TaskPriority, TaskSize, TaskCategory, taskSizeDescriptions } from '../config/supabase'

interface TaskFilterProps {
  onFilterChange: (filters: TaskFilters) => void
}

export interface TaskFilters {
  priority?: TaskPriority
  size?: TaskSize
  category?: TaskCategory
  timeFrame?: 'today' | 'week' | 'month' | 'all'
}

export const TaskFilter = ({ onFilterChange }: TaskFilterProps) => {
  const [filters, setFilters] = useState<TaskFilters>({})
  const [currentQuestion, setCurrentQuestion] = useState<'initial' | 'priority' | 'size' | 'category' | 'timeFrame'>('initial')

  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const resetFilters = () => {
    setFilters({})
    setCurrentQuestion('initial')
    onFilterChange({})
  }

  const renderQuestion = () => {
    switch (currentQuestion) {
      case 'initial':
        return (
          <Box textAlign="center" mb={3}>
            <Typography variant="h6" gutterBottom>
              How would you like to view your tasks?
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" gap={1}>
              <Chip
                label="By Priority"
                onClick={() => setCurrentQuestion('priority')}
                color="primary"
                variant="outlined"
              />
              <Chip
                label="By Size"
                onClick={() => setCurrentQuestion('size')}
                color="primary"
                variant="outlined"
              />
              <Chip
                label="By Category"
                onClick={() => setCurrentQuestion('category')}
                color="primary"
                variant="outlined"
              />
              <Chip
                label="By Time Frame"
                onClick={() => setCurrentQuestion('timeFrame')}
                color="primary"
                variant="outlined"
              />
            </Stack>
          </Box>
        )

      case 'priority':
        return (
          <FormControl fullWidth>
            <InputLabel>Select Priority</InputLabel>
            <Select
              value={filters.priority || ''}
              label="Select Priority"
              onChange={(e) => handleFilterChange({ priority: e.target.value as TaskPriority })}
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        )

      case 'size':
        return (
          <FormControl fullWidth>
            <InputLabel>Select Size</InputLabel>
            <Select
              value={filters.size || ''}
              label="Select Size"
              onChange={(e) => handleFilterChange({ size: e.target.value as TaskSize })}
            >
              <MenuItem value="">All Sizes</MenuItem>
              {(Object.keys(taskSizeDescriptions) as TaskSize[]).map((size) => (
                <MenuItem key={size} value={size}>
                  {size} - {taskSizeDescriptions[size]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )

      case 'category':
        return (
          <FormControl fullWidth>
            <InputLabel>Select Category</InputLabel>
            <Select
              value={filters.category || ''}
              label="Select Category"
              onChange={(e) => handleFilterChange({ category: e.target.value as TaskCategory })}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="office">Office</MenuItem>
              <MenuItem value="career">Career</MenuItem>
              <MenuItem value="family">Family</MenuItem>
            </Select>
          </FormControl>
        )

      case 'timeFrame':
        return (
          <FormControl fullWidth>
            <InputLabel>Select Time Frame</InputLabel>
            <Select
              value={filters.timeFrame || ''}
              label="Select Time Frame"
              onChange={(e) => handleFilterChange({ timeFrame: e.target.value as TaskFilters['timeFrame'] })}
            >
              <MenuItem value="">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>
        )
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
      {renderQuestion()}
      
      {currentQuestion !== 'initial' && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setCurrentQuestion('initial')} color="primary">
            Back to Questions
          </Button>
          <Button onClick={resetFilters} color="secondary">
            Reset Filters
          </Button>
        </Box>
      )}

      {Object.keys(filters).length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Active Filters:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {filters.priority && (
              <Chip
                label={`Priority: ${filters.priority}`}
                onDelete={() => handleFilterChange({ priority: undefined })}
                color="primary"
              />
            )}
            {filters.size && (
              <Chip
                label={`Size: ${filters.size}`}
                onDelete={() => handleFilterChange({ size: undefined })}
                color="primary"
              />
            )}
            {filters.category && (
              <Chip
                label={`Category: ${filters.category}`}
                onDelete={() => handleFilterChange({ category: undefined })}
                color="primary"
              />
            )}
            {filters.timeFrame && (
              <Chip
                label={`Time: ${filters.timeFrame}`}
                onDelete={() => handleFilterChange({ timeFrame: undefined })}
                color="primary"
              />
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  )
} 