import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createProject, getProjects, type Project } from "../api/auth";

function AllProject() {
  const [projects, setProject] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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

  return (
    <section className="space-y-6">
      <form
        className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:flex-row"
        onSubmit={handleCreateProject}
      >
        <input
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="Название нового проекта"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <button
          className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          disabled={isCreating}
          type="submit"
        >
          {isCreating ? "Создание..." : "Создать проект"}
        </button>
      </form>

      <div className="grid gap-4">
        {projects.length ? (
          projects.map((el) => (
            <Link
              key={el.id}
              to={`/projects/${el.id}`}
              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-slate-100 transition hover:border-cyan-400 hover:bg-slate-900"
            >
              <div>
                <p className="text-lg font-semibold">{el.name}</p>
                <p className="text-sm text-slate-400">{el.language}</p>
              </div>
              <span className="rounded-lg bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950">
                Открыть
              </span>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-8 text-center text-slate-400">
            Пока проектов нет. Создай первый сверху.
          </div>
        )}
      </div>
    </section>
  );
}

export default AllProject;
