import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/components/common';
import React from 'react';
import { VeleroBackup } from '../../api/velero';
import { VELERO_LABELS } from '../../utils/constants';
import { formatNamespaceList } from '../../utils/formatters';
import StatusChip from '../common/StatusChip';
import CreateBackupDialog from './CreateBackupDialog';

export default function BackupList() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <ResourceListView
        title="Velero Backups"
        resourceClass={VeleroBackup}
        columns={[
          'name',
          'namespace',
          {
            id: 'status',
            label: 'Status',
            getValue: item => item.phase,
            render: item => <StatusChip phase={item.phase} />,
          },
          {
            id: 'storage-location',
            label: 'Storage Location',
            getValue: item => item.storageLocation,
          },
          {
            id: 'included-namespaces',
            label: 'Namespaces',
            getValue: item => formatNamespaceList(item.includedNamespaces),
          },
          {
            id: 'schedule',
            label: 'Schedule',
            getValue: item => item.metadata.labels?.[VELERO_LABELS.SCHEDULE_NAME] || '-',
          },
          {
            id: 'errors',
            label: 'Errors',
            getValue: item => String(item.errors),
          },
          {
            id: 'warnings',
            label: 'Warnings',
            getValue: item => String(item.warnings),
          },
          'age',
        ]}
        headerProps={{
          titleSideActions: [
            <button
              key="create-backup"
              onClick={() => setOpen(true)}
              style={{
                padding: '6px 16px',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              + Create Backup
            </button>,
          ],
        }}
      />
      <CreateBackupDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
