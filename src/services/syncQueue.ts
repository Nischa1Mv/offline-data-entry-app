// No-ops kept for call-site compatibility after removing @aegiondynamic/async-storage-sync.
// The queue is now plain AsyncStorage (see pendingQueue.ts).
export async function ensureSyncQueueInitialized(_idToken?: string | null) {}
export async function updateSyncQueueCredentials(_idToken?: string | null) {}
