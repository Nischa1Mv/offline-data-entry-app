type Listener = () => void;
const _listeners: Listener[] = [];

export const queueEvents = {
  notify() {
    _listeners.forEach(l => l());
  },
  subscribe(listener: Listener): () => void {
    _listeners.push(listener);
    return () => {
      const i = _listeners.indexOf(listener);
      if (i >= 0) _listeners.splice(i, 1);
    };
  },
};
