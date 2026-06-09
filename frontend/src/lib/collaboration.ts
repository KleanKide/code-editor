import { io } from "socket.io-client";
import * as Y from "yjs";

const API_URL = import.meta.env.VITE_API_URL;

export type CollaboratorPresence = {
  color: string;
  cursor?: {
    column: number;
    lineNumber: number;
  };
  name: string;
  socketId: string;
  userId: string;
};

export function createCollaboration(projectId: string) {
  const socket = io(API_URL, {
    autoConnect: false,
    withCredentials: true,
  });

  const doc = new Y.Doc();
  const text = doc.getText("monaco");
  let cursorTimer: number | null = null;

  socket.on("connect", () => {
    socket.emit("project:join", { projectId });
  });

  socket.on("project:init", ({ update }: { update: number[] }) => {
    Y.applyUpdate(doc, Uint8Array.from(update), "remote");
  });

  socket.on("project:update", (update: number[]) => {
    Y.applyUpdate(doc, Uint8Array.from(update), "remote");
  });

  doc.on("update", (update: Uint8Array, origin) => {
    if (origin === "remote") {
      return;
    }

    socket.emit("project:update", {
      projectId,
      update: Array.from(update),
    });
  });

  return {
    doc,
    text,
    socket,
    sendCursor(position: { column: number; lineNumber: number } | null) {
      if (cursorTimer) {
        window.clearTimeout(cursorTimer);
      }

      cursorTimer = window.setTimeout(() => {
        socket.emit("project:cursor", {
          projectId,
          position,
        });
      }, 60);
    },
    connect() {
      socket.connect();
    },
    destroy() {
      if (cursorTimer) {
        window.clearTimeout(cursorTimer);
      }
      socket.disconnect();
      doc.destroy();
    },
  };
}
