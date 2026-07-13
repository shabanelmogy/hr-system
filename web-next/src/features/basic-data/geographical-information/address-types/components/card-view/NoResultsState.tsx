import { NoResultsState as ReusableNoResultsState } from "@/shared/components/feedback";
import { NoResultsStateProps } from "./AddressTypeCard.types";

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