import React from 'react'

function NoFriendsFound() {
  return (
    <div className='p-6 text-center card bg-base-200'>
        <h3 className='mb-2 text-lg font-semibold'>No friends yet!</h3>
        <p className='opacity-70 text-base-content'>
            Connect with firnds below to start 
        </p>
    </div>
  );
};

export default NoFriendsFound;