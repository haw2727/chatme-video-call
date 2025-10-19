import React from 'react';
import { LANGUAGE_TO_FLAG } from '../constants/constantLang';

export function getLanguageFlag(language) {
    if(!language) return null;
    
    const langLower = language.toLowerCase();
    const countryCode = LANGUAGE_TO_FLAG[langLower];

    if(countryCode) {
        return (
            <img 
                src={`https://flagcdn.com/24x18/${countryCode}.png`} 
                alt={`${language} flag`}
                className='inline-block h-3' 
            />
        );
    }
    return null;
}


export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);