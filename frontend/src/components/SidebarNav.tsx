import { NavLink } from "react-router-dom";

type SidebarNavProps = {
  projectId?: string;
};

function DashboardIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 5.5h7v5H4v-5Zm9 0h7v9h-7v-9ZM4 12.5h7v6H4v-6Zm9 4h7v2h-7v-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m9 8-4 4 4 4M15 8l4 4-4 4M13 6l-2 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SidebarLink({
  icon,
  label,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-stone-900 text-white"
            : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
        }`
      }
    >
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function SidebarNav({ projectId }: SidebarNavProps) {
  return (
    <aside className="sticky top-8 self-start rounded-[1.75rem] border border-stone-300/70 bg-white/82 p-4 shadow-[0_20px_60px_rgba(28,25,23,0.08)] backdrop-blur">
      <div className="mb-4 px-2">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-500">
          Navigate
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        <SidebarLink
          icon={<DashboardIcon />}
          label="Dashboard"
          to="/dashboard"
        />
        {projectId ? (
          <SidebarLink
            icon={<CodeIcon />}
            label="Current project"
            to={`/projects/${projectId}`}
          />
        ) : null}
      </nav>
    </aside>
  );
}

export default SidebarNav;
