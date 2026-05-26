const API_URL = import.meta.env.VITE_API_URL;

function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Code Editor
          </p>
          <h1 className="text-4xl font-semibold text-white">
            Войди и открой свои проекты
          </h1>
        </div>

        <button
          className="w-fit rounded-xl bg-cyan-400 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-300"
          onClick={() => (window.location.href = `${API_URL}/auth/google`)}
        >
          Войти через Google
        </button>
      </div>
    </main>
  );
}

export default LoginPage;
