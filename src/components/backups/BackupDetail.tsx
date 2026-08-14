import {
  DetailsGrid,
  NameValueTable,
  SectionBox,
  SimpleTable,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import Button from '@mui/material/Button';
import React from 'react';
import { useParams } from 'react-router-dom';
import { deleteBackup } from '../../api/helpers';
import { VeleroBackup, VeleroRestore } from '../../api/velero';
import { calcDuration, formatDuration, formatNamespaceList, formatResourceList } from '../../utils/formatters';
import StatusChip from '../common/StatusChip';
import CreateRestoreDialog from '../restores/CreateRestoreDialog';

export default function BackupDetail(props: { namespace?: string; name?: string }) {
  const params = useParams<{ namespace: string; name: string }>();
  const { namespace = params.namespace, name = params.name } = props;

  const [restoreOpen, setRestoreOpen] = React.useState(false);
  const [restores] = VeleroRestore.useList({ namespace });

  const relatedRestores = React.useMemo(
    () => (restores || []).filter((r: VeleroRestore) => r.backupName === name),
    [restores, name]
  );

  const handleDelete = async (item: VeleroBackup) => {
    if (window.confirm(`Delete backup "${item.metadata.name}"? This cannot be undone.`)) {
      await deleteBackup(item.metadata.namespace, item.metadata.name);
    }
  };

  return (
    <>
      <DetailsGrid
        resourceType={VeleroBackup}
        name={name}
        namespace={namespace}
        withEvents
        actions={item =>
          item
            ? [
                {
                  id: 'velero.restore-from-backup',
                  action: (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setRestoreOpen(true)}
                    >
                      Restore from Backup
                    </Button>
                  ),
                },
                {
                  id: 'velero.delete-backup',
                  action: (
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item)}
                    >
                      Delete Backup
                    </Button>
                  ),
                },
              ]
            : []
        }
        extraInfo={item =>
          item && [
            { name: 'Phase', value: <StatusChip phase={item.phase} /> },
            { name: 'Storage Location', value: item.storageLocation },
            {
              name: 'Included Namespaces',
              value: formatNamespaceList(item.includedNamespaces),
            },
            {
              name: 'Excluded Namespaces',
              value: formatNamespaceList(item.spec?.excludedNamespaces),
            },
            {
              name: 'Included Resources',
              value: formatResourceList(item.spec?.includedResources),
            },
            {
              name: 'Excluded Resources',
              value: formatResourceList(item.spec?.excludedResources),
            },
            { name: 'TTL', value: formatDuration(item.spec?.ttl) },
            {
              name: 'Snapshot Volumes',
              value: item.spec?.snapshotVolumes !== undefined ? String(item.spec.snapshotVolumes) : '-',
            },
            {
              name: 'FS Backup',
              value: item.spec?.defaultVolumesToFsBackup !== undefined
                ? String(item.spec.defaultVolumesToFsBackup)
                : '-',
            },
            { name: 'Schedule', value: item.scheduleName || '-' },
          ]
        }
        extraSections={item =>
          item && [
            {
              id: 'status-section',
              section: (
                <SectionBox title="Status">
                  <NameValueTable
                    rows={[
                      { name: 'Phase', value: <StatusChip phase={item.phase} /> },
                      { name: 'Start Time', value: item.status?.startTimestamp || '-' },
                      { name: 'Completion Time', value: item.status?.completionTimestamp || '-' },
                      {
                        name: 'Duration',
                        value: calcDuration(
                          item.status?.startTimestamp,
                          item.status?.completionTimestamp
                        ),
                      },
                      { name: 'Expiration', value: item.status?.expiration || '-' },
                      { name: 'Errors', value: String(item.errors) },
                      { name: 'Warnings', value: String(item.warnings) },
                      {
                        name: 'Progress',
                        value: item.progress?.totalItems
                          ? `${item.progress.itemsBackedUp || 0} / ${item.progress.totalItems} items`
                          : '-',
                      },
                    ]}
                  />
                </SectionBox>
              ),
            },
            {
              id: 'related-restores',
              section: (
                <SectionBox title="Related Restores">
                  <SimpleTable
                    columns={[
                      { label: 'Name', getter: (r: VeleroRestore) => r.metadata.name },
                      {
                        label: 'Status',
                        getter: (r: VeleroRestore) => <StatusChip phase={r.phase} />,
                      },
                      {
                        label: 'Completed',
                        getter: (r: VeleroRestore) => r.status?.completionTimestamp || '-',
                      },
                    ]}
                    data={relatedRestores}
                    emptyMessage="No restores created from this backup."
                  />
                </SectionBox>
              ),
            },
            ...(item.spec?.hooks?.resources?.length
              ? [
                  {
                    id: 'hooks-section',
                    section: (
                      <SectionBox title="Hooks">
                        <SimpleTable
                          columns={[
                            { label: 'Hook Name', getter: (h: any) => h.name },
                            {
                              label: 'Resources',
                              getter: (h: any) =>
                                h.resources?.map((r: any) => r.name).join(', ') || '-',
                            },
                          ]}
                          data={item.spec.hooks.resources}
                          emptyMessage="No hooks configured."
                        />
                      </SectionBox>
                    ),
                  },
                ]
              : []),
          ]
        }
      />
      <CreateRestoreDialog
        open={restoreOpen}
        onClose={() => setRestoreOpen(false)}
        defaultBackupName={name}
      />
    </>
  );
}
