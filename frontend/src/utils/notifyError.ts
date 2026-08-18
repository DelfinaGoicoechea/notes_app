import { toast, type ToastOptions } from "react-hot-toast";

export function notifyError(message: string, options?: ToastOptions): void {
    toast.error(message, options);
}
