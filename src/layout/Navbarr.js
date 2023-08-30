"use client";
import React, { useEffect, useState } from "react";
import logo from "@/assets/layout/logo.png";
import { BiSolidUserCircle } from "react-icons/bi";
import { FaUserPlus } from "react-icons/fa";
import {
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineUserPlus,
} from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/app/firebase";
import { Toaster, toast } from "react-hot-toast";
export default function Navbarr() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [data, setData] = useState({});

  const logout = async () => {
    const toastId = toast.loading("Logging user out...");

    try {
      await auth.signOut(); // Log out the user
      toast.success("User successfully logged out", {
        id: toastId,
      });
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout user", {
        id: toastId,
      });
      console.error("Error logging out:", error);
    }
  };
  //fetching user data in realtime
  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "users", `${user.uid}`), (doc) => {
        setData(doc.data());
        //console.log("sdfersfes");
      });
      return unsub;
    }
  }, [user]);
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
        <h6 style={{ marginLeft: 10 }} className="font-bold hidden lg:block">
          {data && data.username && data.username}
        </h6>
        <button
          onClick={() => router.push(`/user/profile`)}
          style={{ borderRadius: 10 }}
          className="hover:bg-gray-100      bg-gray-50"
        >
          {data && data.image ? (
            <img
              width={50}
              height={50}
              className="object-center object-cover"
              src={data.image}
            />
          ) : (
            <BiSolidUserCircle
              style={{ fontSize: 30, color: "#8E90EA" }}
              className=" text-gray-100"
            />
          )}
        </button>
      </div>
      <Toaster />
    </header>
  );
}
