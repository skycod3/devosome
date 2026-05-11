"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Bell, CheckCheck, Eye, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNotificationsStore } from "@/stores/notifications-store";
import type { Notification } from "@/stores/notifications-store";

const TYPE_STYLES: Record<Notification["type"], string> = {
  info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  success: "bg-green-500/10 text-green-600 border-green-500/20",
  warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  error: "bg-red-500/10 text-red-500 border-red-500/20",
};

const TYPE_DOT: Record<Notification["type"], string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
};

function NotificationItem({ n }: { n: Notification }) {
  const { markAsRead, dismiss } = useNotificationsStore();
  const [open, setOpen] = useState(false);

  function handleOpen() {
    setOpen(true);
    if (!n.read) markAsRead(n.id);
  }

  return (
    <>
      <li
        className={`relative flex gap-3 py-3 px-4 text-sm transition-colors hover:bg-accent/50 ${!n.read ? "bg-muted/40" : ""}`}
      >
        {/* Unread dot */}
        {!n.read && (
          <div className="mt-2 shrink-0">
            <span
              className={`block size-2 rounded-full transition-opacity animate-pulse ${!n.read ? TYPE_DOT[n.type] : "bg-transparent"}`}
            />
          </div>
        )}

        {/* Clickable content area */}
        <button onClick={handleOpen} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-3 mb-1">
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${TYPE_STYLES[n.type]}`}
            >
              {n.type}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(n.timestamp, { addSuffix: true })}
            </span>
          </div>

          <div>
            <p className="font-medium leading-snug line-clamp-1">{n.title}</p>
            {n.description && (
              <p className="text-xs leading-normal text-muted-foreground mt-1 line-clamp-2">
                {n.description}
              </p>
            )}
          </div>
        </button>

        {/* Hover actions */}
        <div className="flex items-center gap-2">
          {!n.read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(n.id);
              }}
              title="Mark as read"
              className="rounded hover:bg-accent transition-colors"
            >
              <Eye className="size-3.5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismiss(n.id);
            }}
            title="Dismiss"
            className="rounded hover:bg-accent transition-colors"
          >
            <X className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      </li>

      {/* Detail Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md top-1/4">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${TYPE_STYLES[n.type]}`}
              >
                {n.type}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(n.timestamp, "PPpp")}
              </span>
            </div>
            <DialogTitle className="text-base leading-snug">
              {n.title}
            </DialogTitle>
            {n.description && (
              <DialogDescription className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">
                {n.description}
              </DialogDescription>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function NotificationCenter() {
  const { notifications, markAllAsRead, dismissAll } = useNotificationsStore();

  return (
    <div className="flex flex-col w-80 max-h-120">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Bell className="size-4" />
          <span className="text-sm font-semibold">Notifications</span>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              className="rounded p-1 hover:bg-accent transition-colors"
            >
              <CheckCheck className="size-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={dismissAll}
              title="Clear all"
              className="rounded p-1 hover:bg-accent transition-colors"
            >
              <Trash2 className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <Bell className="size-8 opacity-30" />
            <p className="text-xs">No notifications</p>
          </div>
        ) : (
          <ul className="divide-y">
            {notifications.map((n) => (
              <NotificationItem key={n.id} n={n} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
