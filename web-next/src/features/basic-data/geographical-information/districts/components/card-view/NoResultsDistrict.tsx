import { NoResultsState as ReusableNoResultsDistrict } from "@/shared/components/feedback/states";

interface NoResultsDistrictProps {
  searchTerm: string;
  onClearSearch: () => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
}

const NoResultsDistrict = ({
  searchTerm,
  onClearSearch,
  onClearFilters,
  onRefresh,
}: NoResultsDistrictProps) => {
  return (
    <ReusableNoResultsDistrict
      searchTerm={searchTerm}
      onClearSearch={onClearSearch}
      onClearFilters={onClearFilters}
      onRefresh={onRefresh}
      sx={{ mt: 3 }}
    />
  );
};

export default NoResultsDistrict;
