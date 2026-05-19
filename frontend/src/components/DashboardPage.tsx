import { useEffect, useState } from 'react';
import { getMe, type Me } from '../api/auth';


function DashboardPage() {
    const [loggedUser, setLoggedUser] = useState<Me | null>(null)
    useEffect(()=>{
        async function loader() {
            const user = await getMe()
            if(!user){
                window.location.href = '/login'
                return;
            }
            setLoggedUser(user)
        }
    
        loader()
    },[])
        console.log(loggedUser)
  return (
    <>
    <img  src={loggedUser?.avatar} alt="avatar" />
    <h1>Добро пожаловать {loggedUser?.name}</h1>
    </>
  )
}

export default DashboardPage