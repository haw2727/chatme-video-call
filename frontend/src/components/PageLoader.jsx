import { LoaderIcon } from 'lucide-react'
import React from 'react'
import { useThemeStore } from '../store/useThemeStore';

function PageLoader() {

  const {theme} = useThemeStore();
  
  return (
    <div className="flex items-center justify-center min-h-screen" data-theme={theme}>
        <LoaderIcon className='animate-spin size-10 text-primary'/>
     {/*  <span className="loading loading-spinner loading-lg"></span> */}
    </div>
  )
}

export default PageLoader;