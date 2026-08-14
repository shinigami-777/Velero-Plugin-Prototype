/**
 * Maps Velero resource phases to MUI severity levels for consistent color coding.
 */
export type VeleroPhase =
  // Backup phases
  | 'New'
  | 'InProgress'
  | 'WaitingForPluginOperations'
  | 'WaitingForPluginOperationsPartiallyFailed'
  | 'Completed'
  | 'PartiallyFailed'
  | 'Failed'
  | 'Deleting'
  // Schedule phases
  | 'Enabled'
  | 'FailedValidation'
  // BSL/VSL phases
  | 'Available'
  | 'Unavailable'
  | 'Unknown';

export type MuiSeverity = 'success' | 'info' | 'warning' | 'error' | 'default';

export function getPhaseColor(phase: string | undefined): MuiSeverity {
  switch (phase) {
    case 'Completed':
    case 'Available':
    case 'Enabled':
      return 'success';

    case 'InProgress':
    case 'New':
    case 'WaitingForPluginOperations':
      return 'info';

    case 'PartiallyFailed':
    case 'WaitingForPluginOperationsPartiallyFailed':
    case 'Unknown':
      return 'warning';

    case 'Failed':
    case 'FailedValidation':
    case 'Unavailable':
      return 'error';

    case 'Deleting':
      return 'default';

    default:
      return 'default';
  }
}
