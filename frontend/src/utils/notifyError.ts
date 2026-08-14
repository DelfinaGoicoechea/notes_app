import { toast, type ToastOptions } from "react-hot-toast";

/**
 * Sighted-user channel only (react-hot-toast).
 * Do not use this for screen readers — toast UI is aria-hidden.
 */
export function notifyError(message: string, options?: ToastOptions): void {
  if (options) {
    toast.error(message, options);
    return;
  }
  toast.error(message);
}
