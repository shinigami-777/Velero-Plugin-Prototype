import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/components/common';
import Chip from '@mui/material/Chip';
import React from 'react';
import { VeleroBackupStorageLocation } from '../../api/velero';
import StatusChip from '../common/StatusChip';

export default function BSLList() {
  return (
    <ResourceListView
      title="Backup Storage Locations"
      resourceClass={VeleroBackupStorageLocation}
      columns={[
        'name',
        'namespace',
        {
          id: 'provider',
          label: 'Provider',
          getValue: item => item.provider,
        },
        {
          id: 'bucket',
          label: 'Bucket / Path',
          getValue: item => {
            const prefix = item.prefix;
            return prefix ? `${item.bucket}/${prefix}` : item.bucket;
          },
        },
        {
          id: 'access-mode',
          label: 'Access Mode',
          getValue: item => item.accessMode,
        },
        {
          id: 'default',
          label: 'Default',
          getValue: item => String(item.isDefault),
          render: item =>
            item.isDefault ? (
              <Chip label="Default" size="small" color="primary" />
            ) : (
              <span>—</span>
            ),
        },
        {
          id: 'status',
          label: 'Status',
          getValue: item => item.phase,
          render: item => <StatusChip phase={item.phase} />,
        },
        {
          id: 'last-synced',
          label: 'Last Synced',
          getValue: item => item.status?.lastSyncedTime || '-',
        },
        'age',
      ]}
    />
  );
}
