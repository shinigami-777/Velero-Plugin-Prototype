import {
  DetailsGrid,
  NameValueTable,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import React from 'react';
import { useParams } from 'react-router-dom';
import { VeleroVolumeSnapshotLocation } from '../../api/velero';
import StatusChip from '../common/StatusChip';

export default function VSLDetail(props: { namespace?: string; name?: string }) {
  const params = useParams<{ namespace: string; name: string }>();
  const { namespace = params.namespace, name = params.name } = props;

  return (
    <DetailsGrid
      resourceType={VeleroVolumeSnapshotLocation}
      name={name}
      namespace={namespace}
      withEvents
      extraInfo={item =>
        item && [
          { name: 'Phase', value: <StatusChip phase={item.phase} /> },
          { name: 'Provider', value: item.provider },
          { name: 'Status Message', value: item.status?.message || '-' },
        ]
      }
      extraSections={item =>
        item && [
          ...(item.spec?.config && Object.keys(item.spec.config).length > 0
            ? [
                {
                  id: 'provider-config',
                  section: (
                    <SectionBox title="Provider Configuration">
                      <NameValueTable
                        rows={Object.entries(item.spec.config).map(([key, value]) => ({
                          name: key,
                          value: value as string,
                        }))}
                      />
                    </SectionBox>
                  ),
                },
              ]
            : []),
          ...(item.spec?.credential
            ? [
                {
                  id: 'credential-section',
                  section: (
                    <SectionBox title="Credential">
                      <NameValueTable
                        rows={[
                          { name: 'Secret Name', value: item.spec.credential.name },
                          { name: 'Secret Key', value: item.spec.credential.key },
                        ]}
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
