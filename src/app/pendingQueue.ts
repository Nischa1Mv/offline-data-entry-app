import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubmissionItem } from '../types';

const STORAGE_KEY = 'pendingSubmissions';

export const initQueue = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

export const getQueue = async (): Promise<SubmissionItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading queue', e);
    return [];
  }
};

export const enqueue = async (submission: SubmissionItem): Promise<SubmissionItem> => {
  const queue = await getQueue();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...queue, submission]));
  console.log('Enqueued submission:', submission.id);
  return submission;
};

export const clearQueue = async () => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
};

export const removeFromQueue = async (id: string) => {
  const queue = await getQueue();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(queue.filter(item => item.id !== id))
  );
};
