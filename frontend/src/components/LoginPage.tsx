import { useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function LoginPage() {
  const [searchParams] = useSearchParams();

  function handleLogin() {
    const next = searchParams.get("next");

    if (next) {
      localStorage.setItem("post_login_redirect", next);
    }

    window.location.href = `${API_URL}/auth/google`;
  }

  return (
    <main className="min-h-screen px-6 py-8 text-stone-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <section className="grid w-full gap-6 rounded-[2rem] border border-stone-300/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(28,25,23,0.08)] backdrop-blur md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div className="space-y-6">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Collaborative Editor
            </p>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold leading-tight text-stone-950 md:text-5xl">
                Quiet workspace for writing code together.
              </h1>
              <p className="max-w-lg text-base leading-7 text-stone-600">
                Open projects, invite teammates with one link, and edit in the
                same file without the interface getting in your way.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-stone-500">
                Authentication
              </p>
              <p className="text-sm leading-6 text-stone-600">
                Use your Google account to continue to the dashboard.
              </p>
            </div>

            <button
              className="mt-8 rounded-full border border-stone-900 bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              onClick={handleLogin}
            >
              Continue with Google
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
