import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  createProject,
  deleteProject,
  getProjects,
  type Project,
} from "../api/auth";

function AllProject() {
  const [projects, setProject] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const isSubmitDisabled = !projectName.trim() || isCreating;

  useEffect(() => {
    getProjects()
      .then((userProject) => {
        setProject(() => userProject);
      })
      .catch((err) => console.log(err));
  }, []);

  async function handleCreateProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = projectName.trim();
    if (!trimmedName) {
      return;
    }

    try {
      setIsCreating(true);
      const project = await createProject(trimmedName);
      setProject((prev) => [project, ...prev]);
      setProjectName("");
    } catch (err) {
      console.log(err);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteProject(projectId: string) {
    const shouldDelete = window.confirm(
      "Delete this project? This action cannot be undone.",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingProjectId(projectId);
      await deleteProject(projectId);
      setProject((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      console.log(err);
    } finally {
      setDeletingProjectId(null);
    }
  }

  const ownProjects = projects.filter((project) => project.isOwner);
  const sharedProjects = projects.filter((project) => !project.isOwner);

  return (
    <section className="space-y-5">
      <form
        className="flex flex-col gap-3 rounded-[1.75rem] border border-stone-300/70 bg-white/82 p-4 shadow-[0_16px_40px_rgba(28,25,23,0.06)] md:flex-row"
        onSubmit={handleCreateProject}
      >
        <input
          className="flex-1 rounded-full border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950"
          placeholder="New project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <button
          className="rounded-full border border-stone-900 bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-500"
          disabled={isSubmitDisabled}
          type="submit"
        >
          {isCreating ? "Creating..." : "Create project"}
        </button>
      </form>

      {projects.length ? (
        <div className="space-y-5">
          <div className="space-y-3" id="my-projects">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                My projects
              </h2>
              <span className="text-xs text-stone-400">{ownProjects.length}</span>
            </div>

            {ownProjects.length ? (
              <div className="grid gap-3">
                {ownProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-[1.5rem] border border-stone-300/70 bg-white/80 px-5 py-4 text-stone-900 transition hover:border-stone-950 hover:bg-white"
                  >
                    <Link to={`/projects/${project.id}`} className="min-w-0 flex-1">
                      <div className="space-y-1">
                        <p className="text-base font-medium">{project.name}</p>
                        <p className="text-sm text-stone-500">{project.language}</p>
                      </div>
                    </Link>

                    <div className="ml-4 flex items-center gap-3">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm text-stone-500 transition hover:text-stone-900"
                      >
                        Open
                      </Link>
                      <button
                        className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
                        disabled={deletingProjectId === project.id}
                        onClick={() => void handleDeleteProject(project.id)}
                        type="button"
                      >
                        {deletingProjectId === project.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/60 px-5 py-8 text-center text-sm text-stone-500">
                No own projects yet.
              </div>
            )}
          </div>

          <div className="space-y-3" id="shared-projects">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                Shared with me
              </h2>
              <span className="text-xs text-stone-400">{sharedProjects.length}</span>
            </div>

            {sharedProjects.length ? (
              <div className="grid gap-3">
                {sharedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-[1.5rem] border border-stone-300/70 bg-white/80 px-5 py-4 text-stone-900 transition hover:border-stone-950 hover:bg-white"
                  >
                    <Link to={`/projects/${project.id}`} className="min-w-0 flex-1">
                      <div className="space-y-1">
                        <p className="text-base font-medium">{project.name}</p>
                        <p className="text-sm text-stone-500">
                          {project.language} • shared by {project.owner.name}
                        </p>
                      </div>
                    </Link>

                    <div className="ml-4 flex items-center gap-3">
                      <span className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-500">
                        Shared
                      </span>
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm text-stone-500 transition hover:text-stone-900"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/60 px-5 py-8 text-center text-sm text-stone-500">
                No shared projects yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/60 px-5 py-10 text-center text-sm text-stone-500">
          No projects yet. Create your first one above.
        </div>
      )}
    </section>
  );
}

export default AllProject;
