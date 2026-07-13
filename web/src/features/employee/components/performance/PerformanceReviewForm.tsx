/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Rating,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  Close,
  Person,
  CalendarToday,
  Assessment,
  Flag,
  Comment,
  Edit,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PerformanceReview, PerformanceCategory, PerformanceGoal } from '../../types/Employee';

interface PerformanceReviewFormProps {
  review?: PerformanceReview;
  employeeId: string;
  employeeName: string;
  onSave: (review: Partial<PerformanceReview>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

const defaultCategories: Omit<PerformanceCategory, 'id'>[] = [
  { name: 'Technical Skills', rating: 3, weight: 25, comments: '' },
  { name: 'Communication', rating: 3, weight: 20, comments: '' },
  { name: 'Leadership', rating: 3, weight: 20, comments: '' },
  { name: 'Problem Solving', rating: 3, weight: 20, comments: '' },
  { name: 'Teamwork', rating: 3, weight: 15, comments: '' },
];

const PerformanceReviewForm: React.FC<PerformanceReviewFormProps> = ({
  review,
  employeeId,
  employeeName,
  onSave,
  onCancel,
  loading = false,
  error,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<Partial<PerformanceReview>>({
    employeeId,
    reviewPeriod: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    reviewerId: '',
    reviewerName: '',
    overallRating: 3,
    categories: defaultCategories.map((cat, index) => ({ ...cat, id: `cat-${index}` })),
    strengths: [],
    areasForImprovement: [],
    goals: [],
    comments: '',
    status: 'draft',
  });

  const [newStrength, setNewStrength] = useState('');
  const [newArea, setNewArea] = useState('');
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);

  useEffect(() => {
    if (review) {
      setFormData(review);
    }
  }, [review]);

  const handleCategoryChange = (categoryId: string, field: keyof PerformanceCategory, value: any) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories?.map(cat =>
        cat.id === categoryId ? { ...cat, [field]: value } : cat
      ),
    }));
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      setFormData(prev => ({
        ...prev,
        strengths: [...(prev.strengths || []), newStrength.trim()],
      }));
      setNewStrength('');
    }
  };

  const removeStrength = (index: number) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths?.filter((_, i) => i !== index) || [],
    }));
  };

  const addAreaForImprovement = () => {
    if (newArea.trim()) {
      setFormData(prev => ({
        ...prev,
        areasForImprovement: [...(prev.areasForImprovement || []), newArea.trim()],
      }));
      setNewArea('');
    }
  };

  const removeAreaForImprovement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      areasForImprovement: prev.areasForImprovement?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSaveGoal = (goal: Partial<PerformanceGoal>) => {
    if (editingGoal) {
      setFormData(prev => ({
        ...prev,
        goals: prev.goals?.map(g => g.id === editingGoal.id ? { ...g, ...goal } : g) || [],
      }));
    } else {
      const newGoal: PerformanceGoal = {
        id: `goal-${Date.now()}`,
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'performance',
        priority: goal.priority || 'medium',
        targetDate: goal.targetDate || '',
        status: 'not-started',
        progress: 0,
        milestones: [],
        dependencies: [],
        assignedBy: formData.reviewerId,
        assignedTo: employeeId,
        createdAt: new Date().toISOString(),
      };
      setFormData(prev => ({
        ...prev,
        goals: [...(prev.goals || []), newGoal],
      }));
    }
    setGoalDialogOpen(false);
    setEditingGoal(null);
  };

  const removeGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals?.filter(g => g.id !== goalId) || [],
    }));
  };

  const calculateOverallRating = () => {
    if (!formData.categories?.length) return 3;
    const weightedSum = formData.categories.reduce((sum, cat) => sum + (cat.rating * cat.weight), 0);
    const totalWeight = formData.categories.reduce((sum, cat) => sum + cat.weight, 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 3;
  };

  const handleSubmit = async () => {
    const overallRating = calculateOverallRating();
    await onSave({
      ...formData,
      overallRating,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {review ? 'Edit Performance Review' : 'Create Performance Review'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  For: {employeeName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Close />}
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.8)})`
                    }
                  }}
                >
                  {loading ? 'Saving...' : 'Save Review'}
                </Button>
              </Box>
            </Box>

            <Grid container spacing={4}>
              {/* Review Period */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ color: theme.palette.primary.main }} />
                      Review Period
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <DatePicker
                          label="Start Date"
                          value={formData.reviewPeriod?.startDate ? new Date(formData.reviewPeriod.startDate) : null}
                          onChange={(date) => setFormData(prev => ({
                            ...prev,
                            reviewPeriod: {
                              ...prev.reviewPeriod!,
                              startDate: date ? date.toISOString().split('T')[0] : '',
                            }
                          }))}
                          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <DatePicker
                          label="End Date"
                          value={formData.reviewPeriod?.endDate ? new Date(formData.reviewPeriod.endDate) : null}
                          onChange={(date) => setFormData(prev => ({
                            ...prev,
                            reviewPeriod: {
                              ...prev.reviewPeriod!,
                              endDate: date ? date.toISOString().split('T')[0] : '',
                            }
                          }))}
                          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Reviewer Info */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 2, backgroundColor: alpha(theme.palette.secondary.main, 0.05) }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ color: theme.palette.secondary.main }} />
                      Reviewer Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Reviewer Name"
                          value={formData.reviewerName || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, reviewerName: e.target.value }))}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Reviewer ID"
                          value={formData.reviewerId || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, reviewerId: e.target.value }))}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Rating Categories */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assessment sx={{ color: theme.palette.info.main }} />
                      Performance Categories
                    </Typography>
                    <Grid container spacing={2}>
                      {formData.categories?.map((category) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={category.id}>
                          <Card sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                {category.name}
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                  Rating (Weight: {category.weight}%)
                                </Typography>
                                <Rating
                                  value={category.rating}
                                  onChange={(_, value) => handleCategoryChange(category.id, 'rating', value || 3)}
                                  precision={0.5}
                                  size="small"
                                />
                              </Box>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Comments..."
                                value={category.comments || ''}
                                onChange={(e) => handleCategoryChange(category.id, 'comments', e.target.value)}
                                size="small"
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Calculated Overall Rating: {calculateOverallRating().toFixed(1)}/5.0
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Based on weighted average of category ratings
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Strengths */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.success.main }}>
                      Strengths
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="Add a strength..."
                        value={newStrength}
                        onChange={(e) => setNewStrength(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addStrength()}
                        size="small"
                      />
                      <IconButton
                        onClick={addStrength}
                        sx={{ backgroundColor: theme.palette.success.main, color: 'white', '&:hover': { backgroundColor: theme.palette.success.dark } }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.strengths?.map((strength, index) => (
                        <Chip
                          key={index}
                          label={strength}
                          onDelete={() => removeStrength(index)}
                          sx={{
                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Areas for Improvement */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.warning.main }}>
                      Areas for Improvement
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="Add an area for improvement..."
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addAreaForImprovement()}
                        size="small"
                      />
                      <IconButton
                        onClick={addAreaForImprovement}
                        sx={{ backgroundColor: theme.palette.warning.main, color: 'white', '&:hover': { backgroundColor: theme.palette.warning.dark } }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.areasForImprovement?.map((area, index) => (
                        <Chip
                          key={index}
                          label={area}
                          onDelete={() => removeAreaForImprovement(index)}
                          sx={{
                            backgroundColor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main,
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Goals */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Flag sx={{ color: theme.palette.info.main }} />
                        Performance Goals
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => setGoalDialogOpen(true)}
                        size="small"
                      >
                        Add Goal
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      {formData.goals?.map((goal) => (
                        <Grid size={{ xs: 12, md: 6 }} key={goal.id}>
                          <Card sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {goal.title}
                                </Typography>
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setEditingGoal(goal);
                                      setGoalDialogOpen(true);
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => removeGoal(goal.id)}
                                    sx={{ color: theme.palette.error.main }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {goal.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip
                                  label={goal.priority}
                                  size="small"
                                  color={goal.priority === 'high' ? 'error' : goal.priority === 'medium' ? 'warning' : 'default'}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  Due: {new Date(goal.targetDate).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Comments */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Comment sx={{ color: theme.palette.grey[600] }} />
                      Overall Comments
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Provide overall feedback and comments..."
                      value={formData.comments || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

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
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
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
      </Box>
    </LocalizationProvider>
  );
};

// Simple Goal Form Component
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
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth>
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
          <FormControl fullWidth>
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
          <TextField
            fullWidth
            type="date"
            label="Target Date"
            value={formData.targetDate || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
      <DialogActions sx={{ mt: 3 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {goal ? 'Update Goal' : 'Add Goal'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default PerformanceReviewForm;