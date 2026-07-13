/* eslint-disable react/prop-types */
import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  Badge,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Flag,
  CheckCircle,
  Schedule,
  TrendingUp,
  ExpandMore,
  PlayArrow,
  Pause,
  Stop,
  Link as LinkIcon,
  Timeline,
  Assessment,
  CalendarToday,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PerformanceGoal, PerformanceGoalMilestone } from '../../types/Employee';

interface GoalManagementProps {
  employeeId: string;
  goals: PerformanceGoal[];
  onCreateGoal?: (goal: Partial<PerformanceGoal>) => Promise<void>;
  onUpdateGoal?: (goalId: string, updates: Partial<PerformanceGoal>) => Promise<void>;
  onDeleteGoal?: (goalId: string) => Promise<void>;
  onUpdateProgress?: (goalId: string, progress: number) => Promise<void>;
  loading?: boolean;
}

const GoalManagement: React.FC<GoalManagementProps> = ({
  employeeId,
  goals,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onUpdateProgress,
  loading = false,
}) => {
  const theme = useTheme();
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<PerformanceGoal | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [newProgress, setNewProgress] = useState(0);

  const getGoalStatusColor = (status: PerformanceGoal['status']) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'in-progress': return theme.palette.info.main;
      case 'not-started': return theme.palette.grey[500];
      case 'cancelled': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getPriorityColor = (priority: PerformanceGoal['priority']) => {
    switch (priority) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: PerformanceGoal['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'in-progress': return <PlayArrow />;
      case 'not-started': return <Schedule />;
      case 'cancelled': return <Stop />;
      default: return <Flag />;
    }
  };

  const filteredGoals = useMemo(() => {
    return goals.sort((a, b) => {
      // Sort by priority first, then by status, then by target date
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const statusOrder = { 'in-progress': 3, 'not-started': 2, completed: 1, cancelled: 0 };

      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];

      if (aPriority !== bPriority) return bPriority - aPriority;

      const aStatus = statusOrder[a.status];
      const bStatus = statusOrder[b.status];

      if (aStatus !== bStatus) return bStatus - aStatus;

      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    });
  }, [goals]);

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setGoalDialogOpen(true);
  };

  const handleEditGoal = (goal: PerformanceGoal) => {
    setEditingGoal(goal);
    setGoalDialogOpen(true);
  };

  const handleSaveGoal = async (goalData: Partial<PerformanceGoal>) => {
    if (editingGoal) {
      await onUpdateGoal?.(editingGoal.id, goalData);
    } else {
      await onCreateGoal?.({
        ...goalData,
        assignedTo: employeeId,
        status: 'not-started',
        progress: 0,
        milestones: [],
        dependencies: [],
        createdAt: new Date().toISOString(),
      });
    }
    setGoalDialogOpen(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (goalId: string) => {
    await onDeleteGoal?.(goalId);
  };

  const handleUpdateProgress = async () => {
    if (selectedGoal) {
      await onUpdateProgress?.(selectedGoal.id, newProgress);
      setProgressDialogOpen(false);
      setSelectedGoal(null);
      setNewProgress(0);
    }
  };

  const handleStatusChange = async (goal: PerformanceGoal, newStatus: PerformanceGoal['status']) => {
    await onUpdateGoal?.(goal.id, { status: newStatus });
  };

  const GoalCard: React.FC<{ goal: PerformanceGoal }> = ({ goal }) => {
    const isOverdue = new Date(goal.targetDate) < new Date() && goal.status !== 'completed';
    const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
      <Card sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.5)}`, height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {goal.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {goal.description}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={goal.status.replace('-', ' ')}
                size="small"
                sx={{
                  backgroundColor: alpha(getGoalStatusColor(goal.status), 0.1),
                  color: getGoalStatusColor(goal.status),
                  textTransform: 'capitalize'
                }}
                icon={getStatusIcon(goal.status)}
              />
              <IconButton size="small" onClick={() => handleEditGoal(goal)}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteGoal(goal.id)} sx={{ color: theme.palette.error.main }}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {goal.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={goal.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.grey[300], 0.3),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: getGoalStatusColor(goal.status)
                }
              }}
            />
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ p: 1, borderRadius: 1, backgroundColor: alpha(theme.palette.grey[100], 0.5) }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Priority
                </Typography>
                <Chip
                  label={goal.priority}
                  size="small"
                  sx={{
                    backgroundColor: alpha(getPriorityColor(goal.priority), 0.1),
                    color: getPriorityColor(goal.priority),
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ p: 1, borderRadius: 1, backgroundColor: alpha(theme.palette.grey[100], 0.5) }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Category
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {goal.category.replace('-', ' ')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Due: {new Date(goal.targetDate).toLocaleDateString()}
              </Typography>
              {isOverdue && (
                <Typography variant="caption" sx={{ display: 'block', color: theme.palette.error.main }}>
                  Overdue by {Math.abs(daysLeft)} days
                </Typography>
              )}
              {!isOverdue && daysLeft <= 7 && goal.status !== 'completed' && (
                <Typography variant="caption" sx={{ display: 'block', color: theme.palette.warning.main }}>
                  {daysLeft} days left
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {goal.status === 'not-started' && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  onClick={() => handleStatusChange(goal, 'in-progress')}
                >
                  Start
                </Button>
              )}
              {goal.status === 'in-progress' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSelectedGoal(goal);
                    setNewProgress(goal.progress);
                    setProgressDialogOpen(true);
                  }}
                >
                  Update Progress
                </Button>
              )}
              {goal.status !== 'completed' && goal.status !== 'cancelled' && (
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleStatusChange(goal, 'completed')}
                >
                  Complete
                </Button>
              )}
            </Box>
          </Box>

          {goal.milestones && goal.milestones.length > 0 && (
            <Accordion sx={{ mt: 2, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Milestones ({goal.milestones.filter(m => m.status === 'completed').length}/{goal.milestones.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense>
                  {goal.milestones.map((milestone) => (
                    <ListItem key={milestone.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={milestone.title}
                        secondary={milestone.description}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={milestone.status}
                          size="small"
                          color={milestone.status === 'completed' ? 'success' : milestone.status === 'overdue' ? 'error' : 'default'}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Goal Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage performance goals
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateGoal}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`
              }
            }}
          >
            Create Goal
          </Button>
        </Box>

        {/* Goals Grid */}
        {filteredGoals.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Flag sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No goals created yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by creating your first performance goal
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateGoal}
            >
              Create First Goal
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredGoals.map((goal) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={goal.id}>
                <GoalCard goal={goal} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Goal Dialog */}
        <Dialog
          open={goalDialogOpen}
          onClose={() => {
            setGoalDialogOpen(false);
            setEditingGoal(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
          <DialogContent>
            <GoalForm
              goal={editingGoal}
              onSave={handleSaveGoal}
              onCancel={() => {
                setGoalDialogOpen(false);
                setEditingGoal(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Progress Update Dialog */}
        <Dialog
          open={progressDialogOpen}
          onClose={() => {
            setProgressDialogOpen(false);
            setSelectedGoal(null);
            setNewProgress(0);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Goal Progress</DialogTitle>
          <DialogContent>
            {selectedGoal && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {selectedGoal.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Current Progress: {selectedGoal.progress}%
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  label="New Progress (%)"
                  value={newProgress}
                  onChange={(e) => setNewProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  inputProps={{ min: 0, max: 100 }}
                  sx={{ mb: 2 }}
                />
                <LinearProgress
                  variant="determinate"
                  value={newProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.grey[300], 0.3),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: theme.palette.primary.main
                    }
                  }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setProgressDialogOpen(false);
              setSelectedGoal(null);
              setNewProgress(0);
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProgress} variant="contained">
              Update Progress
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
          onClick={handleCreateGoal}
        >
          <Add />
        </Fab>
      </Box>
    </LocalizationProvider>
  );
};

// Goal Form Component
const GoalForm: React.FC<{
  goal?: PerformanceGoal | null;
  onSave: (goal: Partial<PerformanceGoal>) => void;
  onCancel: () => void;
}> = ({ goal, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PerformanceGoal>>({
    title: '',
    description: '',
    category: 'performance',
    priority: 'medium',
    targetDate: '',
    ...goal,
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Box sx={{ pt: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Goal Title"
            value={formData.title || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category || 'performance'}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as PerformanceGoal['category'] }))}
            >
              <MenuItem value="professional-development">Professional Development</MenuItem>
              <MenuItem value="performance">Performance</MenuItem>
              <MenuItem value="behavioral">Behavioral</MenuItem>
              <MenuItem value="project-specific">Project Specific</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority || 'medium'}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as PerformanceGoal['priority'] }))}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DatePicker
            label="Target Date"
            value={formData.targetDate ? new Date(formData.targetDate) : null}
            onChange={(date) => setFormData(prev => ({
              ...prev,
              targetDate: date ? date.toISOString().split('T')[0] : ''
            }))}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
      </Grid>
      <DialogActions sx={{ mt: 3 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title || !formData.description || !formData.targetDate}
        >
          {goal ? 'Update Goal' : 'Create Goal'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default GoalManagement;