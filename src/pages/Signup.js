"use client";
import React, { useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/app/firebase";
import { Toaster, toast } from "react-hot-toast";
import { useAuthContext } from "@/context/AuthContext";
const ErrorComponent = () => {
  return (
    <div role="alert" class="rounded border-s-4 border-red-500 bg-red-50 p-4">
      <strong class="block font-medium text-red-800">
        {" "}
        Something went wrong{" "}
      </strong>

      <p class="mt-2 text-sm text-red-700">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nemo quasi
        assumenda numquam deserunt consectetur autem nihil quos debitis dolor
        culpa.
      </p>
    </div>
  );
};
export default function Signup() {
  const provider = new GoogleAuthProvider();
  const [error, setError] = useState(false);
  const [inputs, setInputs] = useState({ name: "", surname: "" });
  const handleGoogleSignup = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;

        //  ==========> (dont use this )  setProfile(user);
        //saving the user in local storage
        //     ==========> (dont use this ) localStorage.setItem("chaty-app-user", JSON.parse(user));
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        // const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  const handleSubmit = () => {
    const toastId = toast.loading("Signing up in...");
    setError(false);
    if (inputs.email != "" && inputs.password != "") {
      createUserWithEmailAndPassword(auth, inputs.email, inputs.password)
        .then(async (userCredential) => {
          // Signed in

          const user = userCredential.user;
          const { email, uid } = user;
          await setDoc(doc(db, "users", `${uid}`), {
            email,
            id: uid,
          });
          const docRef = doc(db, "users", `${uid}`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            toast.success("User successfuly logged in", {
              id: toastId,
            });
          } else {
            // docSnap.data() will be undefined in this case
            console.log("No such user!");
            toast.error("No such user!", {
              id: toastId,
            });
          }

          // ...
        })
        .catch((error) => {
          const errorMessage = error.message;
          toast.error(`${errorMessage}`, {
            id: toastId,
          });
        });
    }
  };
  return (
    <section className="bg-white">
      {error && <ErrorComponent />}
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <aside className="relative block h-16 lg:order-last lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt="Pattern"
            src="https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </aside>

        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl">
            <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              Welcome to Chatty Pals
            </h1>

            <p className="mt-4 leading-relaxed text-gray-500">
              A realtime chat up developed by{" "}
              <span className="hover:text-blue-600 cursor-pointer font-medium text-black">
                Larry Kingstone
              </span>
            </p>

            <div className="mt-8 grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <label
                  for="Email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  type="email"
                  id="Email"
                  name="email"
                  value={inputs.email}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      email: e.target.value,
                    })
                  }
                  className="mt-1 p-4 border w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  for="Password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  type="password"
                  id="Password"
                  value={inputs.password}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      password: e.target.value,
                    })
                  }
                  name="password"
                  className="mt-1 p-4 border w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  for="PasswordConfirmation"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password Confirmation
                </label>

                <input
                  type="password"
                  id="PasswordConfirmation"
                  name="password_confirmation"
                  value={inputs.password_confirmation}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      password_confirmation: e.target.value,
                    })
                  }
                  className="mt-1 w-full p-4 border rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                />
              </div>

              <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                <button
                  type="submit"
                  onClick={() => handleSubmit()}
                  className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
                >
                  Create an account
                </button>

                <p className="mt-4 text-sm text-gray-500 sm:mt-0">
                  Already have an account?
                  <a
                    href="/user/signin"
                    className="text-gray-700 ml-3 underline"
                  >
                    Log in
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </section>
  );
}
