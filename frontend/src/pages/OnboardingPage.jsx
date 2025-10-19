import React, { useState } from 'react'
import useAuthUser from '../hooks/useAuthUser'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeOnboardingData } from '../lib/api.js';
import toast from 'react-hot-toast';
import { CameraIcon, LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon } from 'lucide-react';
import { LANGUAGES } from '../constants/constantLang.js';

function OnboardingPage() {
      const { authUser } = useAuthUser();
      const [formState, setFormState] = useState({
        fullName: authUser?.fullName || "",
        bio: authUser?.bio || "",
        nativeLanguage: authUser?.nativeLanguage || "",
        learningLanguage: authUser?.learningLanguage || "",
        location: authUser?.location || "",
        profilePic: authUser?.profilePic || "",
      });

      const queryClient = useQueryClient();

      const { mutate: onboardingMutation, isPending } = useMutation({
        mutationFn: completeOnboardingData,
        onSuccess: ()=> {
          toast.success("Onboarding/profile completed successfully!");
          queryClient.invalidateQueries(['authUser']);
        },
        onError: (error) => {
          const resp = error?.response?.data;
          if (resp?.missingFields && Array.isArray(resp.missingFields) && resp.missingFields.length > 0) {
            const fields = resp.missingFields.join(', ');
            toast.error(`Please fill the following fields: ${fields}`);
          } else {
            toast.error(resp?.message || 'Onboarding failed. Please try again.');
          }
        }
      });

      const handleSubmit = (e) => {
        e.preventDefault();

        onboardingMutation(formState);
      };
     const handleRandomAvatar = () => {
        const randomId = Math.floor(Math.random() * 100);
        const randomAvatarUrl = `https://avatar.iran.liara.run/public/${randomId}.png`;
        setFormState({ ...formState, profilePic: randomAvatarUrl });
        toast.success("Random profile picture generated successfully!");
     };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-base-100">
      <div className= "w-full max-w-3xl shadow-xl card bg-base-200">
        <div className= "p-6 card-body sm:-8">
          <h1 className="mb-6 text-2xl font-bold text-center">Complete Your Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/**Profile Picture */}
              <div className ="flex flex-col items-center justify-center space-y-4">
                {/**image preview */}
                <div className="w-32 h-32 overflow-hidden bg-gray-300 rounded-full">
                {formState.profilePic ? (
                  <img src={formState.profilePic} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 bg-gray-300 rounded-full">
                    <CameraIcon className="w-12 h-12 text-base-content opacity-40" />
                  </div>
                )}
                </div>
                {/**Generate Random Avatar button  */}
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                    <ShuffleIcon className="w-4 h-4 mr-2" />
                    Generate Random Avatar
                  </button>
                </div>
              </div>
              {/** Full Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Full Name</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formState.fullName}
                    onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                    className="w-full input input-bordered" 
                  />
                </div>
                {/** Bio */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Bio</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formState.bio}
                    onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                    className="w-full textarea textarea-bordered"
                    aria-placeholder='A short bio about yourself'
                  />
                </div>
                {/**languages */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/** Learning Language */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Learning Language</span>
                  </label>
                  <select
                    name="learningLanguage"
                    value={formState.learningLanguage}
                    onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                    className="w-full select select-bordered"
                  >
                    <option value="">Select a language you are learning</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
                {/** Native Language */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Native Language</span>
                  </label>
                  <select
                    name="nativeLanguage"
                    value={formState.nativeLanguage}
                    onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                    className="w-full select select-bordered"
                  >
                    <option value="">Select your native language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`native-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
                </div>
                {/** Location */}
                <div className = "form-control">
                  <label className="label">
                    <span className="label-text">Location</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-base-content opacity-70" />
                    <input
                      type="text"
                      name="location"
                      value={formState.location}
                      onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                      className="w-full pl-10 input input-bordered"
                      placeholder= "Enter your location"
                    />
                  </div>
                </div>
                {/** Submit Button */}
                <button type="submit" className="w-full btn btn-primary" disabled={isPending}>
                  {isPending ? (
                    <>
                      <ShipWheelIcon className="w-5 h-5 mr-2 " />
                      complette onboarding...
                    </>
                  ) : (
                    <>
                       <LoaderIcon className="w-5 h-5 mr-2 opacity-0 animate-spin" />
                       Onboarding...
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
    </div>

  );
}

export default OnboardingPage