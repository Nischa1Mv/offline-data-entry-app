export type ToastType = 'success' | 'pending' | 'loading';

type ShowListener = (message: string, type: ToastType) => void;
type HideListener = () => void;

const _showListeners: ShowListener[] = [];
const _hideListeners: HideListener[] = [];

export const toast = {
  show(message: string, type: ToastType = 'success') {
    _showListeners.forEach(l => l(message, type));
  },
  hide() {
    _hideListeners.forEach(l => l());
  },
  subscribe(onShow: ShowListener, onHide?: HideListener): () => void {
    _showListeners.push(onShow);
    if (onHide) _hideListeners.push(onHide);
    return () => {
      const i = _showListeners.indexOf(onShow);
      if (i >= 0) _showListeners.splice(i, 1);
      if (onHide) {
        const j = _hideListeners.indexOf(onHide);
        if (j >= 0) _hideListeners.splice(j, 1);
      }
    };
  },
};
