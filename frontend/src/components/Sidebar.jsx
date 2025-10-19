

import React from "react";
import { BellIcon, HomeIcon, MessageSquareIcon, ShieldUserIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser.js";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  console.log(currentPath);

  return (
    <aside className="sticky top-0 flex-col hidden w-64 h-screen border-r bg-base-200 border-base-300 lg:flex">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <MessageSquareIcon className="size-9 text-primary" />
          <span className="font-mono text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            ChatMe
          </span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link
        to="/"
        className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath==="/" ? "btn-avtive" : ""}`}>
          <HomeIcon className="size-5 text-baze-content opacity-70" />
          <span>Home</span>
        </Link>
        <Link
        to="/friends"
        className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath==="/friends" ? "btn-avtive" : ""}`}>
          <ShieldUserIcon className="size-5 text-baze-content opacity-70" />
          <span>Friends</span>
        </Link>
        <Link
        to="/notifications"
        className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath==="/notifications" ? "btn-avtive" : ""}`}>
          <BellIcon className="size-5 text-baze-content opacity-70" />
          <span>Notificatios</span>
        </Link>
      </nav>
        {/**User Profile Section */}
      <div className="p-4 mt-auto border-t border-base-300">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
               <img src={authUser?.profilePic} alt="User image/avatar" />
            </div>
          </div>
          <div>
            <p  className="text-sm font-semibold">{authUser?.fullName}</p>
            <p className="flex items-center gap-1 text-xs text-success">
              <span className="inline rounded size-2-full bg-success-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
