import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type NotificationType = "info" | "success" | "error" | "warning";

export type Notification = {
  id: string;
  dedupeId?: string;
  title: string;
  description?: string;
  type: NotificationType;
  /** Unix timestamp in ms */
  timestamp: number;
  /** Unix timestamp in ms — if set, the notification expires at this time */
  expiresAt?: number;
  read: boolean;
};

type AddNotificationPayload = Omit<
  Notification,
  "id" | "timestamp" | "read"
> & {
  expiresIn?: number; // ms from now
};

type NotificationsStore = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: AddNotificationPayload) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback for Safari on non-HTTPS (e.g. local network IP testing)
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useNotificationsStore = create<NotificationsStore>()(
  devtools(
    persist(
      (set, get) => ({
        notifications: [],
        unreadCount: 0,

        addNotification: (n) =>
          set((state) => {
            // dedupe: skip if a notification with the same dedupeId already exists
            if (
              n.dedupeId &&
              state.notifications.some((x) => x.dedupeId === n.dedupeId)
            ) {
              return state;
            }

            const { expiresIn, ...rest } = n;
            const expiresAt =
              expiresIn != null ? Date.now() + expiresIn : undefined;
            const notification: Notification = {
              ...rest,
              id: generateId(),
              timestamp: Date.now(),
              expiresAt,
              read: false,
            };

            // Schedule runtime removal at the exact expiry time
            if (expiresAt != null) {
              const ms = expiresAt - Date.now();
              setTimeout(() => {
                get().dismiss(notification.id);
              }, ms);
            }

            return {
              notifications: [notification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            };
          }),

        markAsRead: (id) =>
          set((state) => {
            const target = state.notifications.find((n) => n.id === id);
            if (!target || target.read) return state;
            return {
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n,
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            };
          }),

        markAllAsRead: () =>
          set((state) => ({
            notifications: state.notifications.map((n) => ({
              ...n,
              read: true,
            })),
            unreadCount: 0,
          })),

        dismiss: (id) =>
          set((state) => {
            const target = state.notifications.find((n) => n.id === id);
            return {
              notifications: state.notifications.filter((n) => n.id !== id),
              unreadCount:
                target && !target.read
                  ? Math.max(0, state.unreadCount - 1)
                  : state.unreadCount,
            };
          }),

        dismissAll: () => set({ notifications: [], unreadCount: 0 }),
      }),
      {
        name: "notifications-store",
        onRehydrateStorage: () => (state) => {
          if (!state) return;
          const now = Date.now();
          const alive = state.notifications.filter(
            (n) => !n.expiresAt || n.expiresAt > now,
          );
          state.notifications = alive;
          state.unreadCount = alive.filter((n) => !n.read).length;
        },
      },
    ),
    { name: "notifications-store" },
  ),
);
