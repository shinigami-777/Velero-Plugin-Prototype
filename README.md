# Velero Headlamp Plugin

This is a prototype Headlamp plugin designed to manage and monitor [Velero](https://velero.io/) backup and restore operations directly from within the [Headlamp](https://headlamp.dev/) Kubernetes UI.

## Features
- **Velero Dashboard:** A centralized overview displaying backup health summaries (completed, failed, in-progress), recent backup activities, configured storage locations, and schedule adherence.
- **Resource Management:** View lists and detailed pages for all key Velero Custom Resources (CRDs):
  - Backups
  - Restores
  - Schedules
  - Backup Storage Locations (BSL)
  - Volume Snapshot Locations (VSL)
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

