export interface TrackChangeLog {
  id: string | number;
  changeLogId: string | number;
  entityName: string;
  key: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  changedByPc: string;
}
