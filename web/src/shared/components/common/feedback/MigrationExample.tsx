import React from 'react';
import { NoResultsState } from './';

/**
 * Migration Example: How to replace the old states/components/cardView/NoResultsState.tsx
 * with the new reusable NoResultsState component
 */

// OLD IMPLEMENTATION (from states/components/cardView/NoResultsState.tsx)
/*
interface NoResultsStateProps {
  searchTerm: string;
  onClearSearch: () => void;
}

const OldNoResultsState = ({ searchTerm, onClearSearch }: NoResultsStateProps) => {
  const theme = useTheme();

  return (
    <Paper sx={{
      p: 4,
      textAlign: 'center',
      mt: 3,
      background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`
    }}>
      <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No States Found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        No states match your search criteria "{searchTerm}"
      </Typography>
      <Button
        variant="outlined"
        onClick={onClearSearch}
        startIcon={<Search />}
      >
        Clear Search
      </Button>
    </Paper>
  );
};
*/

// NEW IMPLEMENTATION using reusable component
interface StatesNoResultsProps {
  searchTerm: string;
  onClearSearch: () => void;
}

const StatesNoResults: React.FC<StatesNoResultsProps> = ({ 
  searchTerm, 
  onClearSearch 
}) => {
  return (
    <NoResultsState
      searchTerm={searchTerm}
      message="No States Found"
      subtitle={`No states match your search criteria "${searchTerm}"`}
      onClearSearch={onClearSearch}
      sx={{ mt: 3 }} // Maintain the original margin-top
    />
  );
};

// Even simpler - direct usage without wrapper:
const DirectUsage: React.FC<StatesNoResultsProps> = ({ 
  searchTerm, 
  onClearSearch 
}) => {
  return (
    <NoResultsState
      searchTerm={searchTerm}
      onClearSearch={onClearSearch}
      sx={{ mt: 3 }}
    />
  );
};

export { StatesNoResults, DirectUsage };