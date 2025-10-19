import React from 'react'
import {LoaderIcon} from 'lucide-react';
function ChatLoader() {
  return (
    <div className='h-screen flex flex-col items-center justify-center p-4'>
        <LoaderIcon className='animate-spin h-10 w-10 text-blue-500 mb-4'/>
        <p className='mt-4 text-center text-lg font-mono'>connecting to chat...</p>
    </div>
  )
}

export default ChatLoader
    