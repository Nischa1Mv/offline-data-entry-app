import axios from 'axios';
import { EXPO_PUBLIC_BACKEND_URL } from '@env';
import { getIdToken } from './auth/tokenStorage';
import { getQueue, removeFromQueue } from '../app/pendingQueue';
import { SubmissionItem } from '../types';
import { toast } from '../lib/toast';
import { queueEvents } from '../lib/queueEvents';

export interface SubmissionResult {
  success: boolean;
  form: SubmissionItem;
  result?: any;
  reason?: string;
}

let _running = false;

export async function processQueue(): Promise<SubmissionResult[]> {
  if (_running) return [];
  _running = true;

  try {
    const queue = await getQueue();
    if (queue.length === 0) return [];

    let idToken = await getIdToken();
    if (!idToken) return [];

    toast.show('Submitting forms…', 'loading');

    const submit = async (item: SubmissionItem) => {
      const doPost = (token: string | null) =>
        axios.post(`${EXPO_PUBLIC_BACKEND_URL}/submit`, item, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          validateStatus: () => true,
        });

      let resp = await doPost(idToken);
      if (resp.status === 401) {
        idToken = await getIdToken({ forceRefresh: true });
        resp = await doPost(idToken);
      }
      return resp;
    };

    const results = await Promise.allSettled(queue.map(item => submit(item)));

    const processed: SubmissionResult[] = await Promise.all(
      results.map(async (res, i) => {
        const form = queue[i];
        if (res.status === 'fulfilled' && res.value.data?.success === true) {
          await removeFromQueue(form.id);
          return { success: true, form, result: res.value.data };
        }
        const httpStatus = res.status === 'fulfilled' ? res.value.status : undefined;
        return {
          success: false,
          form,
          reason:
            httpStatus === 401
              ? 'Authentication error'
              : res.status === 'rejected'
              ? res.reason?.message ?? 'Network error'
              : `Submission failed (${httpStatus ?? 'unknown'})`,
        };
      })
    );

    const succeeded = processed.filter(r => r.success).length;
    if (succeeded > 0) {
      console.log(`[Queue] Auto-submitted ${succeeded}/${queue.length} pending forms`);
      toast.show(`${succeeded} ${succeeded === 1 ? 'form' : 'forms'} submitted successfully`);
      queueEvents.notify();
    } else {
      toast.hide();
    }

    return processed;
  } catch (e) {
    toast.hide();
    throw e;
  } finally {
    _running = false;
  }
}
