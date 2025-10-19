import React from 'react'
import { Link } from 'react-router-dom'; // FIXED: Import from 'react-router-dom' not 'lucide-react'
import { LANGUAGE_TO_FLAG } from '../constants/constantLang';
import { getLanguageFlag } from '../utils/languageUtils';

function FriendCard({friend}) {
  return(
   <div className='transition-shadow card bg-base-200 hover:shadow-md'> {/* FIXED: typo 'fransition' to 'transition' */}
    <div className='p-4 card-body'>
        {/**User Info */}
        <div className='flex items-center gap-3 mb-3'>
            <div className='avatar size-12'>
                <img src={friend.profilePic} alt={friend.fullName} />
            </div>
            <h3 className='font-semibold truncate'>{friend.fullName}</h3>
        </div>
        {/**Language Badges */} 
        <div className='flex flex-wrap gap-1.5 mb-3'>
            <span className='text-xs badge-secondary badge' >
                {getLanguageFlag(friend.nativeLanguage)} {/* FIXED: function name */}
                Native: {friend.nativeLanguage}
            </span>
            <span className='text-xs badge-secondary badge' >
                {getLanguageFlag(friend.learningLanguage)} {/* FIXED: function name */}
                Learning: {friend.learningLanguage}
            </span>
        </div>
        <Link to={`/chat/${friend._id}`} className="w-full btn btn-outline">
           Message
        </Link>
    </div>
  </div>
  );
};



export default FriendCard;