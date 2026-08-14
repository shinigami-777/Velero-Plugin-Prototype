import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/components/common';
import React from 'react';
import { VeleroVolumeSnapshotLocation } from '../../api/velero';
import StatusChip from '../common/StatusChip';

export default function VSLList() {
  return (
    <ResourceListView
      title="Volume Snapshot Locations"
      resourceClass={VeleroVolumeSnapshotLocation}
      columns={[
        'name',
        'namespace',
        {
          id: 'provider',
          label: 'Provider',
          getValue: item => item.provider,
        },
        {
          id: 'region',
          label: 'Region / Zone',
          getValue: item => item.spec?.config?.region || item.spec?.config?.zone || '-',
        },
        {
          id: 'status',
          label: 'Status',
          getValue: item => item.phase,
          render: item => <StatusChip phase={item.phase} />,
        },
        'age',
      ]}
    />
  );
}
