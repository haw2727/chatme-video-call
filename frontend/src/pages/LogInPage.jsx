import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { login } from '../lib/api';
import { MessageSquareIcon } from 'lucide-react';
import{ Link } from 'react-router-dom'

function LogInPage() {

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
   const queryClient = useQueryClient();
     const {mutate:loginMutation,isPending,error}=useMutation({
      mutationFn: login,
      onSuccess: () => queryClient.invalidateQueries({queryKey: ["authUser"]}),
      onError: (err) => {
        console.error('Login error:', err?.response?.data || err);
      }
     });
     const handleLogin=(e) => {
      e.preventDefault();
      loginMutation(formData);
     }
  return (
    <div className ="flex items-center justify-center h-screen p-4 sm-p-8"data-theme="forest" >
       <div className= "flex flex-col w-full max-w-5xl mx-auto overflow-hidden border rounded shadow border-primary/25 lg:flex-row bg-base-100-xl-lg">
              {/**login form section */}
          <div className= "flex flex-col w-full p-4 lg:w-1/2 sm:p-8 ">
            {/**logo  */}
            <div className="flex items-center justify-start gap-2 mb-4">
               <MessageSquareIcon className= "size-9 text-primary"/>
                <span className = "font-mono text-3xl font-bold tracking-wider text-transparentr bg-clip-text bg-gradient-to-r form-primary to-secondsry">
                  ChatMe
                </span>
            </div>
               {/**Error message display */}
              {error && (
                <div className= "mb-4 alert alert-error">
                  <span>{error?.response?.data?.message}</span>
                </div>
              )}
              <div className= "w-full">
                <form onSubmit={handleLogin} className= "">
                  <div className= "space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Wellcome back!</h2>
                        <p className="text-sn opacity-70">
                           Please enter your credentials to access your account.
                       </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className= "w-full space-y-2 form-control">
                        <label className="label">
                          <span className="label-text">Email</span>
                        </label>
                        <input 
                         type="email"
                         placeholder = "hallo@gmail.com"
                         className="w-full input input-bordered"
                         value={formData.email}
                         onChange={(e) =>setFormData({...formData,email: e.target.value})}
                         required
                         />
                      </div>
                      <div className= "w-full space-y-2 form-control">
                        <label className="label">
                          <span className="label-text">Password</span>
                        </label>
                        <input 
                         type="password"
                         placeholder = "........"
                         className="w-full input input-bordered"
                         value={formData.password}
                         onChange={(e) =>setFormData({...formData,password: e.target.value})}
                         required
                         />
                      </div>
                      <button type="submit" className="w-full btn btn-primary" disabled={isPending}>
                        {isPending ? (
                        <>
                           <span className="loadig loading-spinner loading-xs"></span>
                           Signing in...
                        </>
                        ) : (
                          "Log In"
                        )}
                      </button>
                      <div className= "mt-4 text-center">
                        <p className="text-sn">
                          Don't have an account? {""}
                          <Link to="/signup" className="text-primary hover:underline">
                             Create one
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
          </div>
          {/**Image Section */}
          <div className="items-center hidden w-full max-w-sm justif y-center lg:flex lg:w-1/2 bgprimary/10">
            <div className="max-w-md p-8 ">
               <div className="relative max-w-sm mx-auto aspect-square" >
                   <img src="/1.png" alt="Connection Iluatration" className="w-full h-full" />
               </div>
               
               <div className="mt-6 space-y-3 text-center">
                  <h2 className="text-xl font-semibold">Connect whith Chat parenta world</h2>
                  <p className="opacity-70">
                    Practice conversation, make friends,and improve social notwotk.
                  </p>
               </div>
            </div>
          </div>
       </div>
    </div>
  )
}

export default LogInPage