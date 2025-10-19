import React from 'react'
import useAuthUser from '../hooks/useAuthUser'
import { Link, useLocation } from 'react-router-dom';
import { BellIcon, LogOutIcon, MessageSquareIcon } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import useLogout from '../hooks/useLogout';


function Navbar() {
  const {authUser} = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  
  /* const queryClient = useQueryClient();
  
  const {mutate:logoutMutation} = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["authUthr"]})
  }) */
   const {logoutMutation} = useLogout();

  return <nav className="sticky top-0 z-30 flex items-center h-16 border-b bg-base-200 border-base-300 ">
      <div className="container px-4 max-auto sm:px-6 lg:px-8">
         <div className="flex items-center justify-end w-full">
                {/**LOGo -only in the Chat page */}         
                 { isChatPage && (
                    <div className="pl-5">
                       <Link to="/" className="flex items-center gap-2.5">
                           <MessageSquareIcon  className="size-9 text-primary"/>
                           <span className="font-mono text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                              ChatMe
                           </span>
                       </Link>
                    </div>
                  )
                }
              <div className='flex items-center justify-center gap-3 ml-auto sm:gap-4'>
                 <Link to={"notifications"}>
                   <button className='but btn-ghost btn-circle'>
                        <BellIcon className='size-6 text-base-content opacity-70 ' />
                   </button>
                 </Link>
              </div>
              {/**Todo */}
              <ThemeSelector />

              <div className='avatar'>
                <div className='rounded-full w-9'>
                  <img src={authUser?.profilePic} alt="Use Avatar" rel="noreferrer" />
                </div>
              </div>
              {/**Logout Button */}
              <button className='btn btn-ghost btn-circle' onClick={logoutMutation}>
                  <LogOutIcon className='w-6 h-6 text-base-content opacity-70' />
              </button>
         </div>
      </div>
  </nav>
    
  
};

export default Navbar;