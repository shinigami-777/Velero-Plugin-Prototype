import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { VeleroBackup } from '../../api/velero';

interface VeleroInstallCheckProps {
  children: React.ReactNode;
}

/**
 * Checks whether Velero CRDs are accessible.
 * Shows a loading state while checking, an info banner if not installed, or the children if installed.
 */
export default function VeleroInstallCheck({ children }: VeleroInstallCheckProps) {
  // Use the Backup CRD as a proxy for Velero installation status
  const [, error] = VeleroBackup.useList({ namespace: 'velero' });

  if (error) {
    // 403 Forbidden means it exists but we lack RBAC
    if (error.status === 403) {
      return (
        <Alert severity="warning" sx={{ m: 2 }}>
          <strong>Velero access denied.</strong> You may lack the necessary RBAC permissions to view
          Velero resources. Contact your cluster administrator.
        </Alert>
      );
    }

    // 404 / connection error means Velero is likely not installed
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        <strong>Velero does not appear to be installed</strong> on this cluster, or the CRDs are not
        accessible. Install Velero first:{' '}
        <a href="https://velero.io/docs/main/basic-install/" target="_blank" rel="noreferrer">
          velero.io/docs/main/basic-install
        </a>
      </Alert>
    );
  }

  if (error === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return <>{children}</>;
}
