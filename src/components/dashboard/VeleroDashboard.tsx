import { SectionBox, SimpleTable } from '@kinvolk/headlamp-plugin/lib/components/common';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React from 'react';
import {
  VeleroBackup,
  VeleroBackupStorageLocation,
  VeleroSchedule,
} from '../../api/velero';
import { VELERO_NAMESPACE } from '../../utils/constants';
import { calcDuration } from '../../utils/formatters';
import CreateBackupDialog from '../backups/CreateBackupDialog';
import StatusChip from '../common/StatusChip';
import CreateRestoreDialog from '../restores/CreateRestoreDialog';

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number | string;
  color?: string;
}) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h4" component="div" color={color || 'text.primary'} fontWeight={700}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function VeleroDashboard() {
  const [backupDialogOpen, setBackupDialogOpen] = React.useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = React.useState(false);

  const [backups] = VeleroBackup.useList({ namespace: VELERO_NAMESPACE });
  const [schedules] = VeleroSchedule.useList({ namespace: VELERO_NAMESPACE });
  const [bsls] = VeleroBackupStorageLocation.useList({ namespace: VELERO_NAMESPACE });

  const stats = React.useMemo(() => {
    if (!backups) return null;
    return {
      total: backups.length,
      completed: backups.filter((b: VeleroBackup) => b.phase === 'Completed').length,
      failed: backups.filter((b: VeleroBackup) => b.phase === 'Failed').length,
      partial: backups.filter((b: VeleroBackup) => b.phase === 'PartiallyFailed').length,
      inProgress: backups.filter((b: VeleroBackup) => b.phase === 'InProgress').length,
    };
  }, [backups]);

  const recentBackups = React.useMemo(() => {
    if (!backups) return [];
    return [...backups]
      .sort((a: VeleroBackup, b: VeleroBackup) => {
        const aT = new Date(a.metadata.creationTimestamp || 0).getTime();
        const bT = new Date(b.metadata.creationTimestamp || 0).getTime();
        return bT - aT;
      })
      .slice(0, 10);
  }, [backups]);

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Velero Dashboard
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="contained" onClick={() => setBackupDialogOpen(true)}>
            + Create Backup
          </Button>
          <Button variant="outlined" onClick={() => setRestoreDialogOpen(true)}>
            + Create Restore
          </Button>
        </Box>
      </Box>

      {/* Health Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Total Backups" value={stats?.total ?? '—'} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Completed" value={stats?.completed ?? '—'} color="success.main" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Failed" value={stats?.failed ?? '—'} color="error.main" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Partial Failures" value={stats?.partial ?? '—'} color="warning.main" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="In Progress" value={stats?.inProgress ?? '—'} color="info.main" />
        </Grid>
      </Grid>

      {/* Recent Backups */}
      <SectionBox title="Recent Backups">
        <SimpleTable
          columns={[
            { label: 'Name', getter: (b: VeleroBackup) => b.metadata.name },
            {
              label: 'Status',
              getter: (b: VeleroBackup) => <StatusChip phase={b.phase} />,
            },
            { label: 'Storage Location', getter: (b: VeleroBackup) => b.storageLocation },
            {
              label: 'Started',
              getter: (b: VeleroBackup) => b.status?.startTimestamp || '-',
            },
            {
              label: 'Duration',
              getter: (b: VeleroBackup) =>
                calcDuration(b.status?.startTimestamp, b.status?.completionTimestamp),
            },
            {
              label: 'Errors',
              getter: (b: VeleroBackup) => String(b.errors),
            },
          ]}
          data={recentBackups}
          emptyMessage="No backups found."
        />
      </SectionBox>

      {/* Storage Locations */}
      <SectionBox title="Backup Storage Locations">
        <Grid container spacing={2} sx={{ mt: 0 }}>
          {(bsls || []).map((bsl: VeleroBackupStorageLocation) => (
            <Grid item xs={12} sm={6} md={4} key={bsl.metadata.name}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {bsl.metadata.name}
                    </Typography>
                    <StatusChip phase={bsl.phase} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Provider: {bsl.provider}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bucket: {bsl.bucket}
                    {bsl.prefix ? `/${bsl.prefix}` : ''}
                  </Typography>
                  {bsl.isDefault && (
                    <Chip label="Default" size="small" color="primary" sx={{ mt: 1 }} />
                  )}
                  {bsl.status?.lastSyncedTime && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      Last synced: {bsl.status.lastSyncedTime}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {!bsls ||
            (bsls.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No storage locations configured.
                </Typography>
              </Grid>
            ))}
        </Grid>
      </SectionBox>

      {/* Schedules */}
      <SectionBox title="Schedule Adherence">
        <SimpleTable
          columns={[
            { label: 'Name', getter: (s: VeleroSchedule) => s.metadata.name },
            {
              label: 'Status',
              getter: (s: VeleroSchedule) => <StatusChip phase={s.phase} />,
            },
            { label: 'Cron', getter: (s: VeleroSchedule) => s.cronExpression },
            {
              label: 'Paused',
              getter: (s: VeleroSchedule) =>
                s.paused ? (
                  <Chip label="Paused" size="small" color="warning" />
                ) : (
                  <Chip label="Active" size="small" color="success" />
                ),
            },
            { label: 'Last Backup', getter: (s: VeleroSchedule) => s.lastBackup || '-' },
          ]}
          data={schedules || []}
          emptyMessage="No schedules configured."
        />
      </SectionBox>

      <CreateBackupDialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)} />
      <CreateRestoreDialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)} />
    </Box>
  );
}
