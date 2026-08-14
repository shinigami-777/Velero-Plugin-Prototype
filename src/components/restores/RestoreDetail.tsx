import {
  DetailsGrid,
  NameValueTable,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import React from 'react';
import { useParams } from 'react-router-dom';
import { VeleroRestore } from '../../api/velero';
import { calcDuration, formatNamespaceList, formatResourceList } from '../../utils/formatters';
import StatusChip from '../common/StatusChip';

export default function RestoreDetail(props: { namespace?: string; name?: string }) {
  const params = useParams<{ namespace: string; name: string }>();
  const { namespace = params.namespace, name = params.name } = props;

  return (
    <DetailsGrid
      resourceType={VeleroRestore}
      name={name}
      namespace={namespace}
      withEvents
      extraInfo={item =>
        item && [
          { name: 'Phase', value: <StatusChip phase={item.phase} /> },
          { name: 'Source Backup', value: item.backupName },
          { name: 'Schedule Name', value: item.spec?.scheduleName || '-' },
          { name: 'Included Namespaces', value: formatNamespaceList(item.spec?.includedNamespaces) },
          { name: 'Excluded Namespaces', value: formatNamespaceList(item.spec?.excludedNamespaces) },
          { name: 'Included Resources', value: formatResourceList(item.spec?.includedResources) },
          { name: 'Excluded Resources', value: formatResourceList(item.spec?.excludedResources) },
          {
            name: 'Existing Resource Policy',
            value: item.spec?.existingResourcePolicy || 'none',
          },
          {
            name: 'Restore PVs',
            value: item.spec?.restorePVs !== undefined ? String(item.spec.restorePVs) : '-',
          },
          {
            name: 'Preserve Node Ports',
            value: item.spec?.preserveNodePorts !== undefined
              ? String(item.spec.preserveNodePorts)
              : '-',
          },
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
                    { name: 'Errors', value: String(item.errors) },
                    { name: 'Warnings', value: String(item.warnings) },
                    {
                      name: 'Progress',
                      value: item.status?.progress?.totalItems
                        ? `${item.status.progress.itemsBackedUp || 0} / ${item.status.progress.totalItems} items`
                        : '-',
                    },
                  ]}
                />
              </SectionBox>
            ),
          },
          ...(item.spec?.namespaceMapping &&
          Object.keys(item.spec.namespaceMapping).length > 0
            ? [
                {
                  id: 'namespace-mapping',
                  section: (
                    <SectionBox title="Namespace Mapping">
                      <NameValueTable
                        rows={Object.entries(item.spec.namespaceMapping).map(
                          ([src, dst]) => ({ name: src, value: dst })
                        )}
                      />
                    </SectionBox>
                  ),
                },
              ]
            : []),
        ]
      }
    />
  );
}
