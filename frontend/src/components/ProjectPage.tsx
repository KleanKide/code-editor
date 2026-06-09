import { useEffect, useRef, useState } from "react";
import {
  ApiError,
  createOrGetProjectInvite,
  getMe,
  getProject,
  type Project,
} from "../api/auth";
import { useNavigate, useParams } from "react-router-dom";
import Editor, { type OnMount } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import {
  createCollaboration,
  type CollaboratorPresence,
} from "../lib/collaboration";
import SidebarNav from "./SidebarNav";

function ensureRemoteCursorStyle(
  styleRoot: HTMLElement,
  className: string,
  color: string,
) {
  if (styleRoot.querySelector(`[data-cursor-style="${className}"]`)) {
    return;
  }

  const style = document.createElement("style");
  style.dataset.cursorStyle = className;
  style.textContent = `
    .monaco-editor .${className} {
      --remote-cursor-color: ${color};
    }
  `;
  styleRoot.appendChild(style);
}

function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [accessError, setAccessError] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [socketError, setSocketError] = useState("");
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>(
    [],
  );
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const currentProjectId = projectId;

    async function loadProject() {
      const user = await getMe();

      if (!user) {
        navigate(`/?next=${encodeURIComponent(`/projects/${currentProjectId}`)}`, {
          replace: true,
        });
        return;
      }

      getProject(currentProjectId)
        .then((userProject) => {
          setAccessError("");
          setProject(userProject);
        })
        .catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 401) {
            navigate(`/?next=${encodeURIComponent(`/projects/${currentProjectId}`)}`, {
              replace: true,
            });
            return;
          }

          if (error instanceof ApiError && error.status === 404) {
            setAccessError(
              "You do not have access to this project yet. Open it through an invite link first.",
            );
            return;
          }

          console.log(error);
          setAccessError("Unable to open this project.");
        });
    }

    loadProject();
  }, [navigate, projectId]);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    setEditorReady(true);
  };

  useEffect(() => {
    if (!projectId || !project || !editorRef.current || !editorReady) {
      return;
    }

    const collaboration = createCollaboration(projectId);
    const editor = editorRef.current;
    const model = editor.getModel();

    if (!model) {
      collaboration.destroy();
      return;
    }

    if (model.getValue() !== project.code) {
      model.setValue(project.code);
    }

    const cursorDecorations = new Map<string, string[]>();
    const binding = new MonacoBinding(
      collaboration.text,
      model,
      new Set([editor]),
    );

    const syncPresence = (nextCollaborators: CollaboratorPresence[]) => {
      const uniqueCollaborators = Array.from(
        new Map(
          nextCollaborators.map((collaborator) => [
            collaborator.userId,
            collaborator,
          ]),
        ).values(),
      );

      setCollaborators(uniqueCollaborators);

      const localCollaborator = uniqueCollaborators.find(
        (collaborator) => collaborator.socketId === collaboration.socket.id,
      );

      if (localCollaborator) {
        editor
          .getContainerDomNode()
          .style.setProperty("--local-cursor-color", localCollaborator.color);
      }

      const remoteCollaborators = uniqueCollaborators.filter(
        (collaborator) =>
          collaborator.socketId !== collaboration.socket.id &&
          collaborator.cursor,
      );

      for (const [socketId, decorationIds] of cursorDecorations) {
        const stillExists = remoteCollaborators.some(
          (collaborator) => collaborator.socketId === socketId,
        );

        if (!stillExists) {
          model.deltaDecorations(decorationIds, []);
          cursorDecorations.delete(socketId);
        }
      }

      for (const collaborator of remoteCollaborators) {
        const cursor = collaborator.cursor;

        if (!cursor) {
          continue;
        }

        const className = `remote-cursor-${collaborator.socketId}`;
        ensureRemoteCursorStyle(document.head, className, collaborator.color);

        const nextDecorationIds = model.deltaDecorations(
          cursorDecorations.get(collaborator.socketId) ?? [],
          [
            {
              range: {
                startLineNumber: cursor.lineNumber,
                startColumn: cursor.column,
                endLineNumber: cursor.lineNumber,
                endColumn: cursor.column,
              },
              options: {
                className: `remote-cursor-base ${className}`,
              },
            },
          ],
        );

        cursorDecorations.set(collaborator.socketId, nextDecorationIds);
      }
    };

    const handleSocketError = (payload: { message?: string }) => {
      setSocketError(payload.message ?? "Socket error");
    };

    const handleConnectError = () => {
      setSocketError("Realtime connection failed");
    };

    const handlePresence = (payload: {
      collaborators: CollaboratorPresence[];
    }) => {
      syncPresence(payload.collaborators);
    };

    collaboration.socket.on("project:error", handleSocketError);
    collaboration.socket.on("connect_error", handleConnectError);
    collaboration.socket.on("project:presence", handlePresence);
    collaboration.connect();

    const cursorSubscription = editor.onDidChangeCursorPosition((event) => {
      collaboration.sendCursor(event.position);
    });

    return () => {
      collaboration.socket.off("project:error", handleSocketError);
      collaboration.socket.off("connect_error", handleConnectError);
      collaboration.socket.off("project:presence", handlePresence);
      cursorSubscription.dispose();
      binding.destroy();
      for (const decorationIds of cursorDecorations.values()) {
        model.deltaDecorations(decorationIds, []);
      }
      collaboration.destroy();
    };
  }, [editorReady, projectId, project]);

  async function handleCreateInvite() {
    if (!projectId) {
      return;
    }

    try {
      const invite = await createOrGetProjectInvite(projectId);
      await navigator.clipboard.writeText(
        `${window.location.origin}/invite/${invite.token}`,
      );
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 1800);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="min-h-screen px-6 py-8 text-stone-900">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <SidebarNav projectId={projectId} />

        <div className="space-y-4">
          {accessError ? (
            <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50/90 p-5 shadow-[0_20px_60px_rgba(28,25,23,0.08)]">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-700">
                  Access required
                </p>
                <h1 className="text-2xl font-semibold text-stone-950">
                  Project is not available yet
                </h1>
                <p className="text-sm text-stone-700">{accessError}</p>
                <button
                  className="rounded-full border border-stone-900 bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to dashboard
                </button>
              </div>
            </section>
          ) : null}

          {!accessError ? (
            <>
              <section className="rounded-[1.75rem] border border-stone-300/70 bg-white/82 p-5 shadow-[0_20px_60px_rgba(28,25,23,0.08)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                      Project
                    </p>
                    <h1 className="text-2xl font-semibold text-stone-950">
                      {project?.name}
                    </h1>
                  </div>

                  <button
                    className="rounded-full border border-stone-900 bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
                    onClick={handleCreateInvite}
                  >
                    {copiedInvite ? "Copied" : "Copy invite link"}
                  </button>
                </div>

                {socketError ? (
                  <div className="mt-4 rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {socketError}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator.userId}
                      className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700"
                    >
                      <span
                        style={{ backgroundColor: collaborator.color }}
                        className="inline-block h-2.5 w-2.5 rounded-full"
                      />
                      <span>{collaborator.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-[1.75rem] border border-stone-300/70 bg-white/82 p-2 shadow-[0_20px_60px_rgba(28,25,23,0.08)]">
                <div className="h-[calc(100vh-14rem)] overflow-hidden rounded-[1.25rem] border border-stone-200">
                  <Editor
                    height="100%"
                    language={project?.language ?? "javascript"}
                    options={{
                      padding: {
                        top: 16,
                      },
                    }}
                    theme="vs-light"
                    defaultValue={project?.code ?? ""}
                    onMount={handleMount}
                  />
                </div>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default ProjectPage;
