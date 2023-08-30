"use client";
import React from "react";
import logo from "@/assets/layout/logo.png";
import { BiSolidUserCircle } from "react-icons/bi";
import { FaUserPlus } from "react-icons/fa";
import {
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineUserPlus,
} from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
export default function Navbarr() {
  const { user } = useAuthContext();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("chaty_pals_user");

    router.push("/user/signin");
  };
  return (
    <header
      style={{
        top: 0,
        position: "sticky",
        paddingRight: 40,
      }}
      className="flex items-center h-full justify-between p-4 "
    >
      <button onClick={() => router.push("/")} className="  rounded-2xl    ">
        <img src={logo.src} width={80} />
      </button>
      <div className="flex items-center gap-4">
        <button
          onClick={
            user && user.uid
              ? () => logout()
              : () => router.push("/user/signin")
          }
          aria-label="Login with Google"
          type="button"
          className="flex  w-32 items-center justify-center  p-2 space-x-4 border-black hover:bg-black hover:text-white rounded-md focus:ri border-2 focus:ri dark:border-gray-400 focus:ri"
        >
          <p>{user && user.uid ? "Logout" : "Login"}</p>
        </button>
        <button
          onClick={() => router.push(`/user/profile`)}
          style={{ borderRadius: 10, padding: 8 }}
          className="hover:bg-gray-100      bg-gray-50"
        >
          <BiSolidUserCircle
            style={{ fontSize: 30, color: "#8E90EA" }}
            className=" text-gray-100"
          />
        </button>
      </div>
    </header>
  );
}
