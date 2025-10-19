
import { BellIcon } from 'lucide-react'
import React from 'react'

function NoNotificationsFound() {
  return (
    <div className='flex flex-col items-center justify-center py-20 space-y-4'>
        <div className='flex items-center justify-center mb-4 rounded-full size-16 bg-base-300'>
            <BellIcon className='w-8 h-8 opacity-50 text-base-content' />
        </div>
        <h3 className='mb-2 text-2xl font-semibold'>No Notifications Found</h3>
        <p className='text-sm text-center opacity-70'> When you receive a notification, it will appear here.</p>
    </div>
  )
}

export default NoNotificationsFound