"use client";
import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useRouter } from "next/navigation";
import { useActiveProfileContext } from "@/context/ActiveProfileContext";
import { Toaster, toast } from "react-hot-toast";
import { useAuthContext } from "@/context/AuthContext";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSubmit = () => {
    const toastId = toast.loading("Logging in...");
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        //console.log("user is:" + user.data());
        const { uid } = user;
        const docRef = doc(db, "users", `${uid}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          //console.log(profile);
          toast.success("User successfuly logged in", {
            id: toastId,
          });
          localStorage.setItem(
            "chaty_pals_user",
            JSON.stringify(docSnap.data())
          );

          // console.log("Document data:", docSnap.data());
          router.push("/");
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
          toast.error("No such user!", {
            id: toastId,
          });
        }
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.error(`${errorMessage}`, {
          id: toastId,
        });
        // ..
      });
  };
  return (
    <div className="flex w-full flex-col bg-[#d5d5f8] my-8 m-auto max-w-md p-6 rounded-md sm:p-10 dark:bg-gray-900 dark:text-gray-100">
      <div className="mb-8 text-center">
        <h1 className="my-3 text-4xl font-bold">Sign in</h1>
        <p className="text-sm dark:text-gray-400">
          Sign in to access your account
        </p>
      </div>
      <div className="space-y-12">
        <div className="space-y-4">
          <div>
            <label for="email" className="block mb-2 text-sm">
              Email address
            </label>
            <input
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@chatyapp.com"
              className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label for="password" className="text-sm">
                Password
              </label>
              <a
                rel="noopener noreferrer"
                href="#"
                className="text-xs hover:underline dark:text-gray-400"
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="*****"
              className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div className="flex items-center w-full my-4">
          <hr className="w-full bg-black text-black h-0.5 " />
          <p className="px-3 font-bold ">OR</p>
          <hr className="w-full  bg-black text-black h-0.5" />
        </div>
        <button
          aria-label="Login with Google"
          type="button"
          className="flex items-center justify-center w-full p-4 space-x-4 border-black hover:bg-black hover:text-white rounded-md focus:ri border-2 focus:ri dark:border-gray-400 focus:ri"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="w-5 h-5 fill-current"
          >
            <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z"></path>
          </svg>
          <p>Login with Google</p>
        </button>
        <div className="  w-full">
          <div className="w-full">
            <button
              aria-label="Login "
              type="button"
              onClick={() => handleSubmit()}
              className="flex mb-4 items-center justify-center w-full p-4 space-x-4 border-black hover:bg-black hover:text-white rounded-md focus:ri border-2 focus:ri dark:border-gray-400 focus:ri"
            >
              <p>Login to Account</p>
            </button>
          </div>
          <p className="px-6 mt-4 text-sm text-center dark:text-gray-400">
            Don't have an account yet?
            <a
              rel="noopener noreferrer"
              href="/user/signup"
              className="hover:underline dark:text-violet-400"
            >
              Sign up
            </a>
            .
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
