import { Icon } from '@iconify/react';
import {
  registerKindIcon,
  registerMapSource,
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import React from 'react';
import BackupDetail from './components/backups/BackupDetail';
import BackupList from './components/backups/BackupList';
import VeleroDashboard from './components/dashboard/VeleroDashboard';
import { veleroMapSource } from './components/map/VeleroMapSource';
import RestoreDetail from './components/restores/RestoreDetail';
import RestoreList from './components/restores/RestoreList';
import ScheduleDetail from './components/schedules/ScheduleDetail';
import ScheduleList from './components/schedules/ScheduleList';
import VSLDetail from './components/snapshots/VSLDetail';
import VSLList from './components/snapshots/VSLList';
import BSLDetail from './components/storage/BSLDetail';
import BSLList from './components/storage/BSLList';

// ─── Sidebar ──────────────────────────────────────────────────────────────────

registerSidebarEntry({
  parent: null,
  name: 'velero',
  label: 'Velero',
  url: '/velero',
  icon: 'mdi:shield-check',
});

registerSidebarEntry({
  parent: 'velero',
  name: 'velero-dashboard',
  label: 'Dashboard',
  url: '/velero',
});

registerSidebarEntry({
  parent: 'velero',
  name: 'velero-backups',
  label: 'Backups',
  url: '/velero/backups',
});

registerSidebarEntry({
  parent: 'velero',
  name: 'velero-restores',
  label: 'Restores',
  url: '/velero/restores',
});

registerSidebarEntry({
  parent: 'velero',
  name: 'velero-schedules',
  label: 'Schedules',
  url: '/velero/schedules',
});

registerSidebarEntry({
  parent: 'velero',
  name: 'velero-bsl',
  label: 'Storage Locations',
  url: '/velero/storage-locations',
});

registerSidebarEntry({
  parent: 'velero',
  name: 'velero-vsl',
  label: 'Snapshot Locations',
  url: '/velero/snapshot-locations',
});

// ─── Routes ───────────────────────────────────────────────────────────────────

registerRoute({
  path: '/velero',
  exact: true,
  component: VeleroDashboard,
  sidebar: 'velero-dashboard',
  name: 'velero-dashboard',
});

registerRoute({
  path: '/velero/backups',
  exact: true,
  component: BackupList,
  sidebar: 'velero-backups',
  name: 'velero-backups',
});

registerRoute({
  path: '/velero/backups/:namespace/:name',
  component: () => <BackupDetail />,
  sidebar: 'velero-backups',
  name: 'velero-backup-detail',
});

registerRoute({
  path: '/velero/restores',
  exact: true,
  component: RestoreList,
  sidebar: 'velero-restores',
  name: 'velero-restores',
});

registerRoute({
  path: '/velero/restores/:namespace/:name',
  component: () => <RestoreDetail />,
  sidebar: 'velero-restores',
  name: 'velero-restore-detail',
});

registerRoute({
  path: '/velero/schedules',
  exact: true,
  component: ScheduleList,
  sidebar: 'velero-schedules',
  name: 'velero-schedules',
});

registerRoute({
  path: '/velero/schedules/:namespace/:name',
  component: () => <ScheduleDetail />,
  sidebar: 'velero-schedules',
  name: 'velero-schedule-detail',
});

registerRoute({
  path: '/velero/storage-locations',
  exact: true,
  component: BSLList,
  sidebar: 'velero-bsl',
  name: 'velero-bsl',
});

registerRoute({
  path: '/velero/storage-locations/:namespace/:name',
  component: () => <BSLDetail />,
  sidebar: 'velero-bsl',
  name: 'velero-bsl-detail',
});

registerRoute({
  path: '/velero/snapshot-locations',
  exact: true,
  component: VSLList,
  sidebar: 'velero-vsl',
  name: 'velero-vsl',
});

registerRoute({
  path: '/velero/snapshot-locations/:namespace/:name',
  component: () => <VSLDetail />,
  sidebar: 'velero-vsl',
  name: 'velero-vsl-detail',
});

// ─── Map Source ───────────────────────────────────────────────────────────────

registerMapSource(veleroMapSource);

// ─── Kind Icons ───────────────────────────────────────────────────────────────

registerKindIcon('Backup', {
  icon: <Icon icon="mdi:database-export" width="70%" height="70%" />,
  color: 'rgb(25, 118, 210)',
});

registerKindIcon('Restore', {
  icon: <Icon icon="mdi:database-import" width="70%" height="70%" />,
  color: 'rgb(25, 118, 210)',
});

registerKindIcon('Schedule', {
  icon: <Icon icon="mdi:clock-outline" width="70%" height="70%" />,
  color: 'rgb(25, 118, 210)',
});

registerKindIcon('BackupStorageLocation', {
  icon: <Icon icon="mdi:cloud-upload" width="70%" height="70%" />,
  color: 'rgb(25, 118, 210)',
});

registerKindIcon('VolumeSnapshotLocation', {
  icon: <Icon icon="mdi:camera" width="70%" height="70%" />,
  color: 'rgb(25, 118, 210)',
});
