import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import { VeleroRestoreInterface } from './velero';

const { post, patch, remove } = ApiProxy;


// Creates a new Velero Backup resource.
export async function createBackup(
  namespace: string,
  name: string,
  spec: Record<string, any>
): Promise<any> {
  return post(`/apis/velero.io/v1/namespaces/${namespace}/backups`, {
    apiVersion: 'velero.io/v1',
    kind: 'Backup',
    metadata: { name, namespace },
    spec,
  });
}


// Deletes a Velero Backup resource.
export async function deleteBackup(namespace: string, name: string): Promise<any> {
  return remove(`/apis/velero.io/v1/namespaces/${namespace}/backups/${name}`);
}


// Creates a new Velero Restore resource.
export async function createRestore(
  namespace: string,
  name: string,
  spec: VeleroRestoreInterface['spec']
): Promise<any> {
  return post(`/apis/velero.io/v1/namespaces/${namespace}/restores`, {
    apiVersion: 'velero.io/v1',
    kind: 'Restore',
    metadata: { name, namespace },
    spec,
  });
}

// Patches a Velero Schedule to set paused state (merge patch).
export async function patchSchedulePaused(
  namespace: string,
  name: string,
  paused: boolean
): Promise<any> {
  return patch(`/apis/velero.io/v1/namespaces/${namespace}/schedules/${name}`, {
    spec: { paused },
  });
}
