import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/components/common';
import Chip from '@mui/material/Chip';
import React from 'react';
import { VeleroSchedule } from '../../api/velero';
import { formatNamespaceList } from '../../utils/formatters';
import StatusChip from '../common/StatusChip';

export default function ScheduleList() {
  return (
    <ResourceListView
      title="Velero Schedules"
      resourceClass={VeleroSchedule}
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
          id: 'cron',
          label: 'Cron',
          getValue: item => item.cronExpression,
        },
        {
          id: 'paused',
          label: 'Paused',
          getValue: item => String(item.paused),
          render: item =>
            item.paused ? (
              <Chip label="Paused" size="small" color="warning" />
            ) : (
              <Chip label="Active" size="small" color="success" />
            ),
        },
        {
          id: 'included-namespaces',
          label: 'Namespaces',
          getValue: item => formatNamespaceList(item.spec?.template?.includedNamespaces),
        },
        {
          id: 'last-backup',
          label: 'Last Backup',
          getValue: item => item.lastBackup || '-',
        },
        'age',
      ]}
    />
  );
}
