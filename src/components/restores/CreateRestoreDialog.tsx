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
import { createRestore } from '../../api/helpers';
import { VeleroBackup } from '../../api/velero';
import { VELERO_NAMESPACE } from '../../utils/constants';

interface CreateRestoreDialogProps {
  open: boolean;
  onClose: () => void;
  defaultBackupName?: string;
}

const STEPS = ['Select Backup', 'Resource Selection', 'Options', 'Review & Create'];

export default function CreateRestoreDialog({
  open,
  onClose,
  defaultBackupName,
}: CreateRestoreDialogProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [backups] = VeleroBackup.useList({ namespace: VELERO_NAMESPACE });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form state
  const [restoreName, setRestoreName] = React.useState('');
  const [backupName, setBackupName] = React.useState(defaultBackupName || '');
  const [includedNamespaces, setIncludedNamespaces] = React.useState('');
  const [excludedNamespaces, setExcludedNamespaces] = React.useState('');
  const [includedResources, setIncludedResources] = React.useState('');
  const [excludedResources, setExcludedResources] = React.useState('');
  const [restorePVs, setRestorePVs] = React.useState(false);
  const [preserveNodePorts, setPreserveNodePorts] = React.useState(false);
  const [existingResourcePolicy, setExistingResourcePolicy] = React.useState<'none' | 'update'>('none');

  // Sync defaultBackupName prop
  React.useEffect(() => {
    if (defaultBackupName) setBackupName(defaultBackupName);
  }, [defaultBackupName]);

  const handleReset = () => {
    setActiveStep(0);
    setRestoreName('');
    setBackupName(defaultBackupName || '');
    setIncludedNamespaces('');
    setExcludedNamespaces('');
    setIncludedResources('');
    setExcludedResources('');
    setRestorePVs(false);
    setPreserveNodePorts(false);
    setExistingResourcePolicy('none');
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
    backupName,
    includedNamespaces: parseCommaSeparated(includedNamespaces),
    excludedNamespaces: parseCommaSeparated(excludedNamespaces),
    includedResources: parseCommaSeparated(includedResources),
    excludedResources: parseCommaSeparated(excludedResources),
    restorePVs,
    preserveNodePorts,
    existingResourcePolicy,
  });

  const handleSubmit = async () => {
    if (!restoreName) {
      setError('Restore name is required.');
      return;
    }
    if (!backupName) {
      setError('Backup name is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createRestore(VELERO_NAMESPACE, restoreName, buildSpec());
      handleClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to create restore.');
    } finally {
      setSubmitting(false);
    }
  };

  const completedBackups = (backups || []).filter(
    (b: VeleroBackup) => b.phase === 'Completed'
  );

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Restore Name"
              value={restoreName}
              onChange={e => setRestoreName(e.target.value)}
              required
              fullWidth
              helperText="Must be a valid Kubernetes name"
            />
            <TextField
              label="Source Backup"
              value={backupName}
              onChange={e => setBackupName(e.target.value)}
              select
              required
              fullWidth
              helperText="Select a completed backup to restore from"
            >
              {completedBackups.map((b: VeleroBackup) => (
                <MenuItem key={b.metadata.name} value={b.metadata.name}>
                  {b.metadata.name}
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
              helperText="Comma-separated list. Leave blank for all."
            />
            <TextField
              label="Excluded Namespaces"
              value={excludedNamespaces}
              onChange={e => setExcludedNamespaces(e.target.value)}
              fullWidth
            />
            <TextField
              label="Included Resources"
              value={includedResources}
              onChange={e => setIncludedResources(e.target.value)}
              fullWidth
              helperText="e.g. pods,deployments"
            />
            <TextField
              label="Excluded Resources"
              value={excludedResources}
              onChange={e => setExcludedResources(e.target.value)}
              fullWidth
            />
          </Box>
        );
      case 2:
        return (
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={restorePVs}
                  onChange={e => setRestorePVs(e.target.checked)}
                />
              }
              label="Restore Persistent Volumes"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={preserveNodePorts}
                  onChange={e => setPreserveNodePorts(e.target.checked)}
                />
              }
              label="Preserve Node Ports"
            />
            <TextField
              label="Existing Resource Policy"
              value={existingResourcePolicy}
              onChange={e => setExistingResourcePolicy(e.target.value as 'none' | 'update')}
              select
              fullWidth
              helperText="What to do with resources that already exist"
            >
              <MenuItem value="none">None (skip existing)</MenuItem>
              <MenuItem value="update">Update existing</MenuItem>
            </TextField>
          </Box>
        );
      case 3: {
        const spec = { name: restoreName, spec: buildSpec() };
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Review your restore configuration:
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
      <DialogTitle>Create Velero Restore</DialogTitle>
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
            {submitting ? 'Creating…' : 'Create Restore'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
