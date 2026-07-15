import { toast } from "sonner";
import { useNotificationsStore } from "@/stores/notifications-store";
import type { NotificationType } from "@/stores/notifications-store";
import { useSounds } from "@/hooks/useSounds";

type NotifyOptions = {
  description?: string;
  duration?: number;
  style?: React.CSSProperties;
  onDismiss?: () => void;
  onAutoClose?: () => void;
  /** Deduplicate: skip if a notification with this id already exists in the store */
  dedupeId?: string;
  /** Auto-expire after this many milliseconds (persisted across sessions) */
  expiresIn?: number;
  /** Delay before showing the toast, in milliseconds */
  delay?: number;
  /** Add to notification center without showing a toast */
  silent?: boolean;
};

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function useNotify() {
  // Selector, not the whole store — otherwise every useNotify consumer
  // re-renders on any notification change (add/read/dismiss).
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const { playToast, playNotification } = useSounds();

  function fire(
    type: NotificationType,
    title: string,
    options: NotifyOptions = {},
  ) {
    const {
      description,
      duration,
      style,
      onDismiss,
      onAutoClose,
      dedupeId,
      expiresIn,
      delay,
      silent,
    } = options;

    // Check for duplicate before adding — if it already exists, skip both
    // the store entry and the toast (notification persisted from a prior session).
    if (dedupeId) {
      const { notifications } = useNotificationsStore.getState();
      if (notifications.some((n) => n.dedupeId === dedupeId)) return;
    }

    const toastOptions = {
      description: description ? truncateText(description, 120) : undefined,
      duration,
      style,
      onDismiss,
      onAutoClose,
    };
    const toastTitle = truncateText(title, 80);

    const showToast = () => {
      addNotification({ type, title, description, dedupeId, expiresIn });

      if (!silent) {
        playToast();

        switch (type) {
          case "success":
            toast.success(toastTitle, toastOptions);
            break;
          case "error":
            toast.error(toastTitle, toastOptions);
            break;
          case "warning":
            toast.warning(toastTitle, toastOptions);
            break;
          default:
            toast(toastTitle, toastOptions);
        }
      } else {
        playNotification();
      }
    };

    if (delay) {
      setTimeout(showToast, delay);
    } else {
      showToast();
    }
  }

  return {
    notify: {
      info: (title: string, options?: NotifyOptions) =>
        fire("info", title, options),
      success: (title: string, options?: NotifyOptions) =>
        fire("success", title, options),
      error: (title: string, options?: NotifyOptions) =>
        fire("error", title, options),
      warning: (title: string, options?: NotifyOptions) =>
        fire("warning", title, options),
    },
  };
}

export { useNotify };
