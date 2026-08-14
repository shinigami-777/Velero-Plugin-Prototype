import { KubeObject, KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';
import { VELERO_LABELS } from '../utils/constants';

// ─── Backup ──────────────────────────────────────────────────────────────────

export interface VeleroBackupProgress {
  totalItems?: number;
  itemsBackedUp?: number;
}

export interface VeleroBackupHook {
  name: string;
  namespaces?: {
    included?: string[];
    excluded?: string[];
  };
  labelSelector?: Record<string, string>;
  resources?: Array<{
    name: string;
    includedNamespaces?: string[];
    excludedNamespaces?: string[];
    includedResources?: string[];
    excludedResources?: string[];
    labelSelector?: Record<string, string>;
    pre?: Array<{
      exec?: {
        container?: string;
        command: string[];
        onError?: string;
        timeout?: string;
      };
    }>;
    post?: Array<{
      exec?: {
        container?: string;
        command: string[];
        onError?: string;
        timeout?: string;
      };
    }>;
  }>;
}

export interface VeleroBackupInterface extends KubeObjectInterface {
  spec: {
    includedNamespaces?: string[];
    excludedNamespaces?: string[];
    includedResources?: string[];
    excludedResources?: string[];
    storageLocation?: string;
    volumeSnapshotLocations?: string[];
    ttl?: string;
    snapshotVolumes?: boolean;
    defaultVolumesToFsBackup?: boolean;
    labelSelector?: {
      matchLabels?: Record<string, string>;
    };
    hooks?: {
      resources?: VeleroBackupHook[];
    };
  };
  status?: {
    phase?: string;
    startTimestamp?: string;
    completionTimestamp?: string;
    expiration?: string;
    errors?: number;
    warnings?: number;
    progress?: VeleroBackupProgress;
    validationErrors?: string[];
  };
}

export class VeleroBackup extends KubeObject<VeleroBackupInterface> {
  static kind = 'Backup';
  static apiName = 'backups';
  static apiVersion = 'velero.io/v1';
  static isNamespaced = true;

  static get detailsRoute() {
    return '/velero/backups/:namespace/:name';
  }

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status || {};
  }

  get phase(): string {
    return this.status?.phase || 'Unknown';
  }

  get storageLocation(): string {
    return this.spec?.storageLocation || '-';
  }

  get includedNamespaces(): string[] {
    return this.spec?.includedNamespaces || [];
  }

  get scheduleName(): string | undefined {
    return this.metadata.labels?.[VELERO_LABELS.SCHEDULE_NAME];
  }

  get errors(): number {
    return this.status?.errors || 0;
  }

  get warnings(): number {
    return this.status?.warnings || 0;
  }

  get progress(): VeleroBackupProgress {
    return this.status?.progress || {};
  }
}

// ─── Restore ─────────────────────────────────────────────────────────────────

export interface VeleroRestoreInterface extends KubeObjectInterface {
  spec: {
    backupName: string;
    scheduleName?: string;
    includedNamespaces?: string[];
    excludedNamespaces?: string[];
    includedResources?: string[];
    excludedResources?: string[];
    namespaceMapping?: Record<string, string>;
    existingResourcePolicy?: 'none' | 'update';
    restorePVs?: boolean;
    preserveNodePorts?: boolean;
    hooks?: {
      resources?: VeleroBackupHook[];
    };
  };
  status?: {
    phase?: string;
    startTimestamp?: string;
    completionTimestamp?: string;
    errors?: number;
    warnings?: number;
    progress?: VeleroBackupProgress;
    validationErrors?: string[];
  };
}

export class VeleroRestore extends KubeObject<VeleroRestoreInterface> {
  static kind = 'Restore';
  static apiName = 'restores';
  static apiVersion = 'velero.io/v1';
  static isNamespaced = true;

  static get detailsRoute() {
    return '/velero/restores/:namespace/:name';
  }

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status || {};
  }

  get phase(): string {
    return this.status?.phase || 'Unknown';
  }

  get backupName(): string {
    return this.spec?.backupName || '-';
  }

  get errors(): number {
    return this.status?.errors || 0;
  }

  get warnings(): number {
    return this.status?.warnings || 0;
  }
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface VeleroScheduleInterface extends KubeObjectInterface {
  spec: {
    schedule: string;
    paused?: boolean;
    useOwnerReferencesInBackup?: boolean;
    skipImmediately?: boolean;
    template: VeleroBackupInterface['spec'];
  };
  status?: {
    phase?: string;
    lastBackup?: string;
    validationErrors?: string[];
  };
}

export class VeleroSchedule extends KubeObject<VeleroScheduleInterface> {
  static kind = 'Schedule';
  static apiName = 'schedules';
  static apiVersion = 'velero.io/v1';
  static isNamespaced = true;

  static get detailsRoute() {
    return '/velero/schedules/:namespace/:name';
  }

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status || {};
  }

  get phase(): string {
    return this.status?.phase || 'Unknown';
  }

  get cronExpression(): string {
    return this.spec?.schedule || '-';
  }

  get paused(): boolean {
    return this.spec?.paused || false;
  }

  get lastBackup(): string | undefined {
    return this.status?.lastBackup;
  }
}

// ─── BackupStorageLocation ───────────────────────────────────────────────────

export interface VeleroBackupStorageLocationInterface extends KubeObjectInterface {
  spec: {
    provider: string;
    objectStorage?: {
      bucket: string;
      prefix?: string;
      caCert?: string;
    };
    config?: Record<string, string>;
    accessMode?: 'ReadWrite' | 'ReadOnly';
    default?: boolean;
    credential?: {
      name: string;
      key: string;
    };
    backupSyncPeriod?: string;
  };
  status?: {
    phase?: string;
    lastSyncedTime?: string;
    lastSyncedRevision?: string;
    message?: string;
    accessMode?: string;
  };
}

export class VeleroBackupStorageLocation extends KubeObject<VeleroBackupStorageLocationInterface> {
  static kind = 'BackupStorageLocation';
  static apiName = 'backupstoragelocations';
  static apiVersion = 'velero.io/v1';
  static isNamespaced = true;

  static get detailsRoute() {
    return '/velero/storage-locations/:namespace/:name';
  }

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status || {};
  }

  get phase(): string {
    return this.status?.phase || 'Unknown';
  }

  get provider(): string {
    return this.spec?.provider || '-';
  }

  get bucket(): string {
    return this.spec?.objectStorage?.bucket || '-';
  }

  get prefix(): string {
    return this.spec?.objectStorage?.prefix || '';
  }

  get isDefault(): boolean {
    return this.spec?.default || false;
  }

  get accessMode(): string {
    return this.spec?.accessMode || 'ReadWrite';
  }
}

// ─── VolumeSnapshotLocation ──────────────────────────────────────────────────

export interface VeleroVolumeSnapshotLocationInterface extends KubeObjectInterface {
  spec: {
    provider: string;
    config?: Record<string, string>;
    credential?: {
      name: string;
      key: string;
    };
  };
  status?: {
    phase?: string;
    message?: string;
  };
}

export class VeleroVolumeSnapshotLocation extends KubeObject<VeleroVolumeSnapshotLocationInterface> {
  static kind = 'VolumeSnapshotLocation';
  static apiName = 'volumesnapshotlocations';
  static apiVersion = 'velero.io/v1';
  static isNamespaced = true;

  static get detailsRoute() {
    return '/velero/snapshot-locations/:namespace/:name';
  }

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status || {};
  }

  get phase(): string {
    return this.status?.phase || 'Unknown';
  }

  get provider(): string {
    return this.spec?.provider || '-';
  }

  get region(): string {
    return this.spec?.config?.region || '-';
  }
}
