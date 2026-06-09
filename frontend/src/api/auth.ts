const API_URL = import.meta.env.VITE_API_URL;

export type Me = {
  id: string;
  email: string;
  name: string;
  avatar: string;
};

export async function getMe(): Promise<Me | null> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export type Project = {
  id: string;
  name: string;
  code: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  membershipRole: "owner" | "editor" | "viewer";
  isOwner: boolean;
  owner: {
    id: string;
    email: string;
    name: string;
  };
};

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("no projects");
  }

  return res.json();
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/projects`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("no projects");
  }

  return res.json();
}

export async function getOneProject(id: string): Promise<Project | null> {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("unauthorized");
  }

  if (!res.ok) {
    throw new Error("no projects");
  }

  return res.json();
}

export async function createProject(name: string): Promise<Project> {
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error("failed to create project");
  }

  return res.json();
}

export async function deleteProject(projectId: string) {
  const res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("failed to delete project");
  }

  return res.json();
}

export async function createOrGetProjectInvite(projectId: string) {
  const res = await fetch(`${API_URL}/projects/${projectId}/invite-link`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error("failed to create invite link");
  }

  return res.json();
}

export async function getProjectInvite(token: string) {
  const res = await fetch(`${API_URL}/projects/invite-links/${token}`, {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("unauthorized");
  }

  if (!res.ok) {
    throw new Error("invite not found");
  }

  return res.json();
}

export async function acceptProjectInvite(token: string) {
  const res = await fetch(`${API_URL}/projects/invite-links/${token}/accept`, {
    method: "POST",
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("unauthorized");
  }

  if (!res.ok) {
    throw new Error("failed to accept invite");
  }

  return res.json();
}
