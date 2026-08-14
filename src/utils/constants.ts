// Route path constants
export const VELERO_ROUTES = {
  DASHBOARD: '/velero',
  BACKUPS: '/velero/backups',
  BACKUP_DETAIL: '/velero/backups/:namespace/:name',
  RESTORES: '/velero/restores',
  RESTORE_DETAIL: '/velero/restores/:namespace/:name',
  SCHEDULES: '/velero/schedules',
  SCHEDULE_DETAIL: '/velero/schedules/:namespace/:name',
  STORAGE_LOCATIONS: '/velero/storage-locations',
  STORAGE_LOCATION_DETAIL: '/velero/storage-locations/:namespace/:name',
  SNAPSHOT_LOCATIONS: '/velero/snapshot-locations',
  SNAPSHOT_LOCATION_DETAIL: '/velero/snapshot-locations/:namespace/:name',
};

// Velero label keys
export const VELERO_LABELS = {
  SCHEDULE_NAME: 'velero.io/schedule-name',
  STORAGE_LOCATION: 'velero.io/storage-location',
  BACKUP_NAME: 'velero.io/backup-name',
};

// Default Velero namespace
export const VELERO_NAMESPACE = 'velero';

// API group
export const VELERO_API_GROUP = 'velero.io';
export const VELERO_API_VERSION = 'v1';
