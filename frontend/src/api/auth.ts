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
