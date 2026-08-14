import {
  DetailsGrid,
  NameValueTable,
  SectionBox,
  SimpleTable,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import Button from '@mui/material/Button';
import React from 'react';
import { useParams } from 'react-router-dom';
import { patchSchedulePaused } from '../../api/helpers';
import { VeleroBackup, VeleroSchedule } from '../../api/velero';
import { VELERO_LABELS } from '../../utils/constants';
import {
  describeCron,
  formatDuration,
  formatNamespaceList,
  formatResourceList,
} from '../../utils/formatters';
import StatusChip from '../common/StatusChip';

export default function ScheduleDetail(props: { namespace?: string; name?: string }) {
  const params = useParams<{ namespace: string; name: string }>();
  const { namespace = params.namespace, name = params.name } = props;

  const [backups] = VeleroBackup.useList({ namespace });

  const childBackups = React.useMemo(
    () =>
      (backups || []).filter(
        (b: VeleroBackup) => b.metadata.labels?.[VELERO_LABELS.SCHEDULE_NAME] === name
      ),
    [backups, name]
  );

  const handlePauseToggle = async (item: VeleroSchedule) => {
    await patchSchedulePaused(item.metadata.namespace, item.metadata.name, !item.paused);
  };

  return (
    <DetailsGrid
      resourceType={VeleroSchedule}
      name={name}
      namespace={namespace}
      withEvents
      actions={item =>
        item
          ? [
              {
                id: 'velero.pause-schedule',
                action: (
                  <Button
                    variant="outlined"
                    size="small"
                    color={item.paused ? 'success' : 'warning'}
                    onClick={() => handlePauseToggle(item)}
                  >
                    {item.paused ? 'Resume Schedule' : 'Pause Schedule'}
                  </Button>
                ),
              },
            ]
          : []
      }
      extraInfo={item =>
        item && [
          { name: 'Phase', value: <StatusChip phase={item.phase} /> },
          { name: 'Cron Expression', value: item.cronExpression },
          { name: 'Human Readable', value: describeCron(item.cronExpression) },
          { name: 'Paused', value: item.paused ? 'Yes' : 'No' },
          { name: 'Last Backup', value: item.lastBackup || '-' },
          {
            name: 'Validation Errors',
            value:
              item.status?.validationErrors?.length
                ? item.status.validationErrors.join('; ')
                : 'None',
          },
        ]
      }
      extraSections={item =>
        item && [
          {
            id: 'backup-template',
            section: (
              <SectionBox title="Backup Template">
                <NameValueTable
                  rows={[
                    {
                      name: 'Included Namespaces',
                      value: formatNamespaceList(item.spec?.template?.includedNamespaces),
                    },
                    {
                      name: 'Excluded Namespaces',
                      value: formatNamespaceList(item.spec?.template?.excludedNamespaces),
                    },
                    {
                      name: 'Included Resources',
                      value: formatResourceList(item.spec?.template?.includedResources),
                    },
                    {
                      name: 'Excluded Resources',
                      value: formatResourceList(item.spec?.template?.excludedResources),
                    },
                    {
                      name: 'Storage Location',
                      value: item.spec?.template?.storageLocation || '-',
                    },
                    {
                      name: 'TTL',
                      value: formatDuration(item.spec?.template?.ttl),
                    },
                    {
                      name: 'Snapshot Volumes',
                      value: item.spec?.template?.snapshotVolumes !== undefined
                        ? String(item.spec.template.snapshotVolumes)
                        : '-',
                    },
                    {
                      name: 'FS Backup',
                      value: item.spec?.template?.defaultVolumesToFsBackup !== undefined
                        ? String(item.spec.template.defaultVolumesToFsBackup)
                        : '-',
                    },
                  ]}
                />
              </SectionBox>
            ),
          },
          {
            id: 'child-backups',
            section: (
              <SectionBox title="Backups Created by This Schedule">
                <SimpleTable
                  columns={[
                    { label: 'Name', getter: (b: VeleroBackup) => b.metadata.name },
                    {
                      label: 'Status',
                      getter: (b: VeleroBackup) => <StatusChip phase={b.phase} />,
                    },
                    {
                      label: 'Started',
                      getter: (b: VeleroBackup) => b.status?.startTimestamp || '-',
                    },
                    {
                      label: 'Completed',
                      getter: (b: VeleroBackup) => b.status?.completionTimestamp || '-',
                    },
                    {
                      label: 'Expiration',
                      getter: (b: VeleroBackup) => b.status?.expiration || '-',
                    },
                  ]}
                  data={childBackups}
                  emptyMessage="No backups created by this schedule yet."
                />
              </SectionBox>
            ),
          },
        ]
      }
    />
  );
}
