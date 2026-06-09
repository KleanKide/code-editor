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
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
        <section className="w-full max-w-md rounded-[2rem] border border-stone-300/70 bg-white/82 p-8 text-center shadow-[0_24px_80px_rgba(28,25,23,0.08)] backdrop-blur md:p-10">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">
              Code Editor
            </p>
            <h1 className="text-4xl font-semibold text-stone-950 md:text-5xl">
              Welcome
            </h1>
            <p className="text-sm leading-6 text-stone-600">
              Sign in to open your workspace.
            </p>
          </div>

          <button
            className="mt-8 w-full rounded-full border border-stone-900 bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            onClick={handleLogin}
          >
            Sign in with Google
          </button>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
