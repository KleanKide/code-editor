const API_URL = import.meta.env.VITE_API_URL;
export type Me = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  
}

export async function getMe (): Promise<Me | null>  {
    const res = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include'
    })
    if(!res.ok){
        return null
    }
    return res.json()

}

export type Project = {
  id: string;
  name: string;
  code: string;
  language: string;
  createdAt: string;
  updatedAt: string;
};

export async function getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'GET',
        credentials: 'include'
    })
    if(!res.ok){
        throw new Error('no projects')
    }
    return res.json()
}

export async function getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_URL}/projects`, {
        method: 'GET',
        credentials: 'include'
    })
    if(!res.ok){
        throw new Error('no projects')
    }
    return res.json()
}
export async function getOneProject(id: string): Promise<Project | null> {
    const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'GET',
        credentials: 'include'
    })
    if(!res.ok){
        throw new Error('no projects')
    }
    return res.json()
}