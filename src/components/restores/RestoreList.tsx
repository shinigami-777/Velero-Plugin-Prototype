import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/components/common';
import { Link } from '@kinvolk/headlamp-plugin/lib/components/common';
import React from 'react';
import { VeleroRestore } from '../../api/velero';
import StatusChip from '../common/StatusChip';
import CreateRestoreDialog from './CreateRestoreDialog';

export default function RestoreList() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <ResourceListView
        title="Velero Restores"
        resourceClass={VeleroRestore}
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
            id: 'backup',
            label: 'Source Backup',
            getValue: item => item.backupName,
            render: item => (
              <Link
                routeName="velero-backup-detail"
                params={{ namespace: item.metadata.namespace, name: item.backupName }}
              >
                {item.backupName}
              </Link>
            ),
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
              key="create-restore"
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
              + Create Restore
            </button>,
          ],
        }}
      />
      <CreateRestoreDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
