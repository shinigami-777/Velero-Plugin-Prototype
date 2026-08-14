import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React from 'react';
import { createBackup } from '../../api/helpers';
import { VeleroBackupStorageLocation } from '../../api/velero';
import { VELERO_NAMESPACE } from '../../utils/constants';

interface CreateBackupDialogProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = ['Basic Info', 'Resource Selection', 'Volume Options', 'Review & Create'];

export default function CreateBackupDialog({ open, onClose }: CreateBackupDialogProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [bsls] = VeleroBackupStorageLocation.useList({ namespace: VELERO_NAMESPACE });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form state
  const [backupName, setBackupName] = React.useState('');
  const [ttl, setTtl] = React.useState('720h0m0s');
  const [storageLocation, setStorageLocation] = React.useState('');
  const [includedNamespaces, setIncludedNamespaces] = React.useState('');
  const [excludedNamespaces, setExcludedNamespaces] = React.useState('');
  const [includedResources, setIncludedResources] = React.useState('');
  const [excludedResources, setExcludedResources] = React.useState('');
  const [snapshotVolumes, setSnapshotVolumes] = React.useState(false);
  const [defaultVolumesToFsBackup, setDefaultVolumesToFsBackup] = React.useState(false);

  const handleReset = () => {
    setActiveStep(0);
    setBackupName('');
    setTtl('720h0m0s');
    setStorageLocation('');
    setIncludedNamespaces('');
    setExcludedNamespaces('');
    setIncludedResources('');
    setExcludedResources('');
    setSnapshotVolumes(false);
    setDefaultVolumesToFsBackup(false);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const parseCommaSeparated = (val: string): string[] | undefined => {
    const arr = val
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return arr.length > 0 ? arr : undefined;
  };

  const buildSpec = () => ({
    storageLocation: storageLocation || undefined,
    ttl: ttl || undefined,
    includedNamespaces: parseCommaSeparated(includedNamespaces),
    excludedNamespaces: parseCommaSeparated(excludedNamespaces),
    includedResources: parseCommaSeparated(includedResources),
    excludedResources: parseCommaSeparated(excludedResources),
    snapshotVolumes,
    defaultVolumesToFsBackup,
  });

  const handleSubmit = async () => {
    if (!backupName) {
      setError('Backup name is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createBackup(VELERO_NAMESPACE, backupName, buildSpec() as any);
      handleClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to create backup.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Backup Name"
              value={backupName}
              onChange={e => setBackupName(e.target.value)}
              required
              fullWidth
              helperText="Must be a valid Kubernetes name (lowercase, alphanumeric, dashes)"
            />
            <TextField
              label="TTL"
              value={ttl}
              onChange={e => setTtl(e.target.value)}
              fullWidth
              helperText="e.g. 720h0m0s (30 days)"
            />
            <TextField
              label="Storage Location"
              value={storageLocation}
              onChange={e => setStorageLocation(e.target.value)}
              select
              fullWidth
              helperText="Leave blank to use the default"
            >
              <MenuItem value="">Default</MenuItem>
              {(bsls || []).map((bsl: VeleroBackupStorageLocation) => (
                <MenuItem key={bsl.metadata.name} value={bsl.metadata.name}>
                  {bsl.metadata.name} ({bsl.provider})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      case 1:
        return (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Included Namespaces"
              value={includedNamespaces}
              onChange={e => setIncludedNamespaces(e.target.value)}
              fullWidth
              helperText="Comma-separated list. Leave blank for all namespaces."
            />
            <TextField
              label="Excluded Namespaces"
              value={excludedNamespaces}
              onChange={e => setExcludedNamespaces(e.target.value)}
              fullWidth
              helperText="Comma-separated list."
            />
            <TextField
              label="Included Resources"
              value={includedResources}
              onChange={e => setIncludedResources(e.target.value)}
              fullWidth
              helperText="e.g. pods,deployments,services. Leave blank for all resources."
            />
            <TextField
              label="Excluded Resources"
              value={excludedResources}
              onChange={e => setExcludedResources(e.target.value)}
              fullWidth
              helperText="Comma-separated list."
            />
          </Box>
        );
      case 2:
        return (
          <Box display="flex" flexDirection="column" gap={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={snapshotVolumes}
                  onChange={e => setSnapshotVolumes(e.target.checked)}
                />
              }
              label="Snapshot Volumes (use volume snapshots)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={defaultVolumesToFsBackup}
                  onChange={e => setDefaultVolumesToFsBackup(e.target.checked)}
                />
              }
              label="Default Volumes to Filesystem Backup (Restic/Kopia)"
            />
          </Box>
        );
      case 3: {
        const spec = buildSpec();
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Review your backup configuration:
            </Typography>
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: 12,
                borderRadius: 4,
                fontSize: '0.8rem',
                overflow: 'auto',
              }}
            >
              {JSON.stringify(spec, null, 2)}
            </pre>
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Velero Backup</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStep()}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep(s => s - 1)} disabled={submitting}>
            Back
          </Button>
        )}
        {activeStep < STEPS.length - 1 ? (
          <Button onClick={() => setActiveStep(s => s + 1)} variant="contained">
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Backup'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
