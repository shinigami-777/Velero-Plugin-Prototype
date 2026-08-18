# Velero Headlamp Plugin

This is a prototype Headlamp plugin designed to manage and monitor [Velero](https://velero.io/) backup and restore operations directly from within the [Headlamp](https://headlamp.dev/) Kubernetes UI.

## Features
- **Velero Dashboard:** A centralized overview displaying backup health summaries (completed, failed, in-progress), recent backup activities, configured storage locations, and schedule adherence.
- **Resource Management:** View lists and detailed pages for all key Velero Custom Resources (CRDs):
  - Backups
  - Restores
  - Schedules
  - Backup Storage Locations
  - Volume Snapshot Locations
- **Interactive Actions:** Create new backups and restores directly through the UI using dedicated dialog components (`CreateBackupDialog`, `CreateRestoreDialog`).
- **Map Visualization:** Integrates with Headlamp's cluster map view to visually represent the relationships between Velero resources (`veleroMapSource`).

## Key Design Decisions
- **API Integration:** The plugin interacts directly with the Kubernetes API to read and manage Velero CRDs (`velero.io/v1`). The `src/api/velero.ts` file abstracts these API interactions, mapping them to TypeScript classes (e.g., `VeleroBackup`, `VeleroRestore`) that extend Headlamp's `KubeObject`.
- **UI Framework:** Built using React and [Material-UI (MUI)](https://mui.com/) to maintain visual consistency with the broader Headlamp ecosystem. It leverages standard Headlamp common components like `SectionBox` and `SimpleTable`.
- **Native Integration:** Uses the `@kinvolk/headlamp-plugin` library to register sidebar entries (`registerSidebarEntry`), routing (`registerRoute`), custom icons (`registerKindIcon`), and map sources (`registerMapSource`). This ensures the plugin feels like a native part of the Headlamp interface rather than a disconnected iframe.


## Development & Usage

### Prerequisites
- Node.js (v22)
- npm
- A Kubernetes cluster with Velero installed.
- Headlamp installed or running locally.

### Basic Setup

1. Install Minikube and start a single node cluster
```
 minikube start
```
You can check that created node using `kubectl get nodes`.
```
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   50s   v1.35.1
```

2. Create namespace
```
kubectl create namespace velero
```

3. Install Minio for storage
```
kubectl apply -n velero -f https://raw.githubusercontent.com/vmware-tanzu/velero/main/examples/minio/00-minio-deployment.yaml
```

4. After this we setup the credentials to access the S3-compatible MinIO bucket. Make a file called credentials-velero add the contents:
```
[default]
aws_access_key_id = minio
aws_secret_access_key = minio123
EOF
```

5. Install velero in the cluster
```
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.9.0 \
  --bucket velero \
  --secret-file ./credentials-velero \
  --use-volume-snapshots=false \
  --backup-location-config \
    region=minio,s3ForcePathStyle="true",s3Url=http://minio.velero.svc:9000
```

You can check the installation using `kubectl get pods -n velero` and `velero get backup-locations`. 

<img width="950" height="137" alt="Screenshot from 2026-08-18 18-23-02" src="https://github.com/user-attachments/assets/4cd51a1f-22b5-4027-81f0-597932e78e00" />

### Running the Plugin
1. Install dependencies
   ```
   npm install
   ```

2. Build the plugin
   ```
   npm run build
   ```
   The artifacts will be generated in the `dist` folder.

3. Start development server of the plugin watching for plugin changes.
   ```
   npm run start
   ```
   This command starts the Headlamp development server with the Velero plugin loaded. It will automatically detect changes to the code.


### Using it with Headlamp
1. Install the headlamp binary from [here](https://github.com/kubernetes-sigs/headlamp/releases).

2. Put the `dist/main.js` inside `~/.config/Headlamp/plugins/velero-plugin-prototype/` folder.

3. Run the headlamp application and use the plugin.

### Prototype Screenshots

**Dashboard View**
<img width="1910" height="1006" alt="image" src="https://github.com/user-attachments/assets/b5c2d76d-98f8-4c86-b141-89d7b968fc9a" />

**Backup Creation**
<img width="1633" height="702" alt="Screenshot from 2026-08-18 18-26-54" src="https://github.com/user-attachments/assets/8e036b98-ec69-4832-97cf-ca53ee7338bb" />

**Restore**
<img width="1175" height="637" alt="Screenshot from 2026-08-18 18-28-00" src="https://github.com/user-attachments/assets/6105f5dc-d7de-49eb-8e89-4332cfb95473" />

**Backup Storage Location**
<img width="1643" height="271" alt="Screenshot from 2026-08-18 18-28-36" src="https://github.com/user-attachments/assets/77af751d-2c4d-45c9-a257-07329fcddc97" />

**Map View**
<img width="1502" height="625" alt="image" src="https://github.com/user-attachments/assets/ed46b2a8-429a-4f1f-9633-2030e40fc2ab" />

