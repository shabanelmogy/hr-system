import { NoResultsState as ReusableNoResultsState } from "@/shared/components/common/feedback";

interface NoResultsStateProps {
  searchTerm: string;
  onClearSearch: () => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
}

const NoResultsState = ({ 
  searchTerm, 
  onClearSearch, 
  onClearFilters, 
  onRefresh 
}: NoResultsStateProps) => {
  return (   
    <ReusableNoResultsState
      searchTerm={searchTerm}
      onClearSearch={onClearSearch}
      onClearFilters={onClearFilters}
      onRefresh={onRefresh}
      sx={{ mt: 3 }}
    />
  );
};

export default NoResultsState;
