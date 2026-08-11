import toast from "react-hot-toast";
import type { Politeness } from "../types/announce"
import type { ToastOptions } from "react-hot-toast";

type AnnounceFn = (message: string, politeness?: Politeness) => void;

let announceImpl: AnnounceFn = () => {};

export function registerAnnouncer(fn: AnnounceFn) {
  announceImpl = fn;
};

export function announce(message: string, politeness?: Politeness) {
  announceImpl(message, politeness);
};

export function notifyError(message: string, options?: ToastOptions) {
  toast.error(message, options);
  announce(message, "assertive");
};