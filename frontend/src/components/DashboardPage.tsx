import { useEffect, useState } from "react";
import { getMe, type Me } from "../api/auth";
import AllProjects from "./AllProjects";

function DashboardPage() {
  const [loggedUser, setLoggedUser] = useState<Me | null>(null);

  useEffect(() => {
    async function loader() {
      const user = await getMe();
      if (!user) {
        window.location.href = "/";
        return;
      }
      setLoggedUser(user);
    }

    loader();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              className="h-16 w-16 rounded-full border border-slate-700 object-cover"
              src={loggedUser?.avatar}
              alt="avatar"
            />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
                Dashboard
              </p>
              <p className="text-3xl font-semibold text-white">
                Добро пожаловать, {loggedUser?.name}
              </p>
            </div>
          </div>
          <p className="max-w-md text-sm text-slate-400">
            Создавай проекты, открывай редактор и проверяй рабочую версию.
          </p>
        </section>

        <AllProjects />
      </div>
    </main>
  );
}

export default DashboardPage;
