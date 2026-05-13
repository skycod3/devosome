import { toast } from "sonner";
import { useNotificationsStore } from "@/stores/notifications-store";
import type { NotificationType } from "@/stores/notifications-store";

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
};

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function useNotify() {
  const { addNotification } = useNotificationsStore();

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
      // Store receives full text; Sonner receives truncated text
      addNotification({ type, title, description, dedupeId, expiresIn });

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
