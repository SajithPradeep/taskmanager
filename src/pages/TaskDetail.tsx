import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  IconButton,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { Task, TaskHistory, supabase, taskSizeDescriptions, TaskStatus, TaskPriority, TaskSize, TaskCategory } from '../config/supabase';
import { getDueDateInfo } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: number;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

interface TaskHistoryExtended extends TaskHistory {
  field_name?: string;
  old_value?: string;
  new_value?: string;
}

export const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [history, setHistory] = useState<TaskHistoryExtended[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch task details
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);
      setEditedTask(taskData);

      // Fetch task history
      const { data: historyData, error: historyError } = await supabase
        .from('task_history')
        .select('*')
        .eq('task_id', taskId)
        .order('changed_at', { ascending: false });

      if (historyError) throw historyError;
      setHistory(historyData);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments(commentsData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!user?.id) {
        setError('No user found. Please sign in again.');
        return;
      }

      setLoading(true);
      setError(null);

      const updates = {
        ...editedTask,
        updated_at: new Date().toISOString()
      };

      // Update task
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Add history records for changed fields
      if (task) {
        const changedFields = Object.entries(editedTask)
          .filter(([key, value]) => task[key as keyof Task] !== value);

        if (changedFields.length > 0) {
          const historyRecords = changedFields.map(([field, value]) => ({
            task_id: taskId,
            action: 'field_updated' as const,
            field_name: field,
            old_value: String(task[field as keyof Task] || ''),
            new_value: String(value || ''),
            changed_by: user.id
          }));

          const { error: historyError } = await supabase
            .from('task_history')
            .insert(historyRecords);

          if (historyError) throw historyError;
        }
      }

      setTask(data);
      setIsEditing(false);
      await fetchTaskDetails();

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Add comment
      const { error: commentError } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          content: newComment,
          author: 'current_user' // Replace with actual user info when auth is added
        });

      if (commentError) throw commentError;

      // Add history record
      const { error: historyError } = await supabase
        .from('task_history')
        .insert({
          task_id: taskId,
          action: 'comment_added',
          changed_by: 'current_user' // Replace with actual user info when auth is added
        });

      if (historyError) throw historyError;

      setNewComment('');
      await fetchTaskDetails();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !task) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Task not found</Alert>
      </Box>
    );
  }

  const dueDateInfo = getDueDateInfo(task.expected_completion_date);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Task Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              {isEditing ? (
                <TextField
                  fullWidth
                  label="Title"
                  value={editedTask.title || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  sx={{ mr: 2 }}
                />
              ) : (
                <Typography variant="h6">{task.title}</Typography>
              )}
              <IconButton onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <CloseIcon /> : <EditIcon />}
              </IconButton>
            </Box>

            {isEditing ? (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={editedTask.status || 'not_started'}
                        label="Status"
                        onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as TaskStatus })}
                      >
                        <MenuItem value="not_started">Not Started</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={editedTask.priority || 'medium'}
                        label="Priority"
                        onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as TaskPriority })}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Size</InputLabel>
                      <Select
                        value={editedTask.size || 'M'}
                        label="Size"
                        onChange={(e) => setEditedTask({ ...editedTask, size: e.target.value as TaskSize })}
                      >
                        {Object.entries(taskSizeDescriptions).map(([size, desc]) => (
                          <MenuItem key={size} value={size}>
                            {size} - {desc}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={editedTask.category || 'personal'}
                        label="Category"
                        onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value as TaskCategory })}
                      >
                        <MenuItem value="personal">Personal</MenuItem>
                        <MenuItem value="office">Office</MenuItem>
                        <MenuItem value="career">Career</MenuItem>
                        <MenuItem value="family">Family</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Expected Completion Date"
                      value={editedTask.expected_completion_date?.split('T')[0] || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, expected_completion_date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                  <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button variant="contained" onClick={handleSave}>Save Changes</Button>
                </Box>
              </Stack>
            ) : (
              <>
                <Typography sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {task.description || 'No description provided.'}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Chip
                    label={task.priority}
                    size="small"
                    color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}
                  />
                  <Chip
                    label={`${task.size} - ${taskSizeDescriptions[task.size]}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={task.category}
                    size="small"
                    variant="outlined"
                  />
                  {dueDateInfo && (
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={dueDateInfo.text}
                      size="small"
                      sx={{ color: dueDateInfo.color }}
                    />
                  )}
                </Stack>
              </>
            )}
          </Paper>

          {/* Comments Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button variant="contained" onClick={handleAddComment}>
                Add Comment
              </Button>
            </Box>
            <Stack spacing={2}>
              {comments.map((comment) => (
                <Box key={comment.id} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2">{comment.author}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography>{comment.content}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity
            </Typography>
            <Stack spacing={2}>
              {history.map((record) => (
                <Box key={record.id}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(record.changed_at).toLocaleString()}
                  </Typography>
                  <Typography>
                    {record.action === 'created' && 'Task created'}
                    {record.action === 'status_changed' && 
                      `Status changed from ${record.previous_status || 'none'} to ${record.new_status}`}
                    {record.action === 'field_updated' &&
                      `${record.field_name} updated from "${record.old_value}" to "${record.new_value}"`}
                    {record.action === 'comment_added' && 'Comment added'}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                <Typography>{new Date(task.created_at).toLocaleString()}</Typography>
              </Box>
              {task.started_at && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Started</Typography>
                  <Typography>{new Date(task.started_at).toLocaleString()}</Typography>
                </Box>
              )}
              {task.completed_at && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Completed</Typography>
                  <Typography>{new Date(task.completed_at).toLocaleString()}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                <Typography>{new Date(task.updated_at).toLocaleString()}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 