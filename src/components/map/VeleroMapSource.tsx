import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import {
  VeleroBackup,
  VeleroBackupStorageLocation,
  VeleroRestore,
  VeleroSchedule,
  VeleroVolumeSnapshotLocation,
} from '../../api/velero';
import { VELERO_LABELS } from '../../utils/constants';
import BackupDetail from '../backups/BackupDetail';
import RestoreDetail from '../restores/RestoreDetail';
import ScheduleDetail from '../schedules/ScheduleDetail';
import VSLDetail from '../snapshots/VSLDetail';
import BSLDetail from '../storage/BSLDetail';

/** Helper to build an edge between two KubeObjects by UID. */
const makeEdge = (from: { metadata: { uid: string } }, to: { metadata: { uid: string } }) => ({
  id: `${from.metadata.uid}--${to.metadata.uid}`,
  source: from.metadata.uid,
  target: to.metadata.uid,
});

const VELERO_BLUE = 'rgb(25, 118, 210)';

// ─── Backup source ────────────────────────────────────────────────────────────

const backupSource = {
  id: 'velero-backups',
  label: 'Backups',
  icon: <Icon icon="mdi:database-export" width="100%" height="100%" color={VELERO_BLUE} />,
  useData() {
    const [backups] = VeleroBackup.useList();
    const [restores] = VeleroRestore.useList();
    const [bsls] = VeleroBackupStorageLocation.useList();

    return useMemo(() => {
      if (!backups) return null;

      const nodes = backups.map((b: VeleroBackup) => ({
        id: b.metadata.uid,
        kubeObject: b,
        weight: 2000,
        detailsComponent: ({ node }: any) => (
          <BackupDetail
            namespace={node.kubeObject.jsonData.metadata.namespace}
            name={node.kubeObject.jsonData.metadata.name}
          />
        ),
      }));

      const edges: any[] = [];

      backups.forEach((backup: VeleroBackup) => {
        // Backup → BSL
        if (backup.storageLocation && bsls) {
          const bsl = (bsls as VeleroBackupStorageLocation[]).find(
            b => b.metadata.name === backup.storageLocation
          );
          if (bsl) edges.push(makeEdge(backup, bsl));
        }

        // Backup → Restore
        if (restores) {
          (restores as VeleroRestore[])
            .filter(r => r.backupName === backup.metadata.name)
            .forEach(r => edges.push(makeEdge(backup, r)));
        }
      });

      return { nodes, edges };
    }, [backups, restores, bsls]);
  },
};

// ─── Schedule source ──────────────────────────────────────────────────────────

const scheduleSource = {
  id: 'velero-schedules',
  label: 'Schedules',
  icon: <Icon icon="mdi:clock-outline" width="100%" height="100%" color={VELERO_BLUE} />,
  useData() {
    const [schedules] = VeleroSchedule.useList();
    const [backups] = VeleroBackup.useList();

    return useMemo(() => {
      if (!schedules) return null;

      const nodes = (schedules as VeleroSchedule[]).map(s => ({
        id: s.metadata.uid,
        kubeObject: s,
        weight: 3000,
        detailsComponent: ({ node }: any) => (
          <ScheduleDetail
            namespace={node.kubeObject.jsonData.metadata.namespace}
            name={node.kubeObject.jsonData.metadata.name}
          />
        ),
      }));

      const edges: any[] = [];

      if (backups) {
        (schedules as VeleroSchedule[]).forEach(schedule => {
          (backups as VeleroBackup[])
            .filter(b => b.metadata.labels?.[VELERO_LABELS.SCHEDULE_NAME] === schedule.metadata.name)
            .forEach(b => edges.push(makeEdge(schedule, b)));
        });
      }

      return { nodes, edges };
    }, [schedules, backups]);
  },
};

// ─── Restore source ───────────────────────────────────────────────────────────

const restoreSource = {
  id: 'velero-restores',
  label: 'Restores',
  icon: <Icon icon="mdi:database-import" width="100%" height="100%" color={VELERO_BLUE} />,
  useData() {
    const [restores] = VeleroRestore.useList();

    return useMemo(() => {
      if (!restores) return null;

      const nodes = (restores as VeleroRestore[]).map(r => ({
        id: r.metadata.uid,
        kubeObject: r,
        weight: 1000,
        detailsComponent: ({ node }: any) => (
          <RestoreDetail
            namespace={node.kubeObject.jsonData.metadata.namespace}
            name={node.kubeObject.jsonData.metadata.name}
          />
        ),
      }));

      return { nodes };
    }, [restores]);
  },
};

// ─── BSL source ───────────────────────────────────────────────────────────────

const bslSource = {
  id: 'velero-bsls',
  label: 'Storage Locations',
  icon: <Icon icon="mdi:cloud-upload" width="100%" height="100%" color={VELERO_BLUE} />,
  useData() {
    const [bsls] = VeleroBackupStorageLocation.useList();

    return useMemo(() => {
      if (!bsls) return null;

      const nodes = (bsls as VeleroBackupStorageLocation[]).map(b => ({
        id: b.metadata.uid,
        kubeObject: b,
        weight: 500,
        detailsComponent: ({ node }: any) => (
          <BSLDetail
            namespace={node.kubeObject.jsonData.metadata.namespace}
            name={node.kubeObject.jsonData.metadata.name}
          />
        ),
      }));

      return { nodes };
    }, [bsls]);
  },
};

// ─── VSL source ───────────────────────────────────────────────────────────────

const vslSource = {
  id: 'velero-vsls',
  label: 'Snapshot Locations',
  icon: <Icon icon="mdi:camera" width="100%" height="100%" color={VELERO_BLUE} />,
  useData() {
    const [vsls] = VeleroVolumeSnapshotLocation.useList();

    return useMemo(() => {
      if (!vsls) return null;

      const nodes = (vsls as VeleroVolumeSnapshotLocation[]).map(v => ({
        id: v.metadata.uid,
        kubeObject: v,
        weight: 500,
        detailsComponent: ({ node }: any) => (
          <VSLDetail
            namespace={node.kubeObject.jsonData.metadata.namespace}
            name={node.kubeObject.jsonData.metadata.name}
          />
        ),
      }));

      return { nodes };
    }, [vsls]);
  },
};

// ─── Exported map source ──────────────────────────────────────────────────────

export const veleroMapSource = {
  id: 'velero',
  label: 'Velero',
  icon: <Icon icon="mdi:shield-check" width="100%" height="100%" color={VELERO_BLUE} />,
  sources: [backupSource, scheduleSource, restoreSource, bslSource, vslSource],
};
