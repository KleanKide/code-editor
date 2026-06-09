import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { acceptProjectInvite } from "../api/auth";

function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invite token is missing");
      return;
    }

    acceptProjectInvite(token)
      .then((result) => {
        navigate(`/projects/${result.projectId}`, { replace: true });
      })
      .catch((error: Error) => {
        if (error.message === "unauthorized") {
          navigate(`/?next=${encodeURIComponent(location.pathname)}`, {
            replace: true,
          });
          return;
        }

        setError("Invite link is not valid");
      });
  }, [location.pathname, navigate, token]);

  return (
    <main className="min-h-screen px-6 py-8 text-stone-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center">
        <section className="w-full rounded-[2rem] border border-stone-300/70 bg-white/82 p-8 shadow-[0_24px_80px_rgba(28,25,23,0.08)]">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
              Invitation
            </p>
            <h1 className="text-3xl font-semibold text-stone-950">
              {error ? "Unable to open project" : "Opening project..."}
            </h1>
            <p className="text-sm text-stone-600">
              {error || "You will be redirected automatically."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default InvitePage;
