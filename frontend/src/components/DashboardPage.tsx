import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, type Me } from "../api/auth";
import AllProjects from "./AllProjects";
import SidebarNav from "./SidebarNav";

function DashboardPage() {
  const [loggedUser, setLoggedUser] = useState<Me | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loader() {
      const user = await getMe();
      if (!user) {
        window.location.href = "/";
        return;
      }

      const postLoginRedirect = localStorage.getItem("post_login_redirect");

      if (postLoginRedirect) {
        localStorage.removeItem("post_login_redirect");
        navigate(postLoginRedirect, { replace: true });
        return;
      }

      setLoggedUser(user);
    }

    loader();
  }, [navigate]);

  return (
    <main className="min-h-screen px-6 py-8 text-stone-900">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <SidebarNav />

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-stone-300/70 bg-white/82 p-6 shadow-[0_20px_60px_rgba(28,25,23,0.08)] backdrop-blur md:p-8">
            <div className="flex items-center gap-4">
              <img
                className="h-14 w-14 rounded-full border border-stone-300 object-cover"
                src={loggedUser?.avatar}
                alt="avatar"
              />
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
                    Dashboard
                  </p>
                  <h1 className="text-3xl font-semibold text-stone-950">
                    {loggedUser?.name}
                  </h1>
                </div>
              </div>
            </div>
          </section>

          <AllProjects />
        </div>
      </div>
    </main>
  );
}

export default DashboardPage;
