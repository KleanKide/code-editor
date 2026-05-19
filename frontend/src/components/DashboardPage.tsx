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
    <div className='flex justify-center gap-2'>
    <img className = 'rounded-4xl'src={loggedUser?.avatar} alt="avatar" />
    <p className='text-5xl'>Добро пожаловать {loggedUser?.name}</p>
    </div>
  )
}

export default DashboardPage