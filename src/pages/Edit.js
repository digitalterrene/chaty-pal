"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useAuthContext } from "@/context/AuthContext";
export default function Edit({ id }) {
  // const { user } = useAuthContext();
  const [inputs, setInputs] = useState({});
  const router = useRouter();
  const [data, setData] = useState();
  const [image, setImage] = useState("");

  const postImage = (pics) => {
    const toastId = toast.loading("Loading..");
    if (pics === undefined) {
      toast.error("Image is required.", {
        id: toastId,
        className: "capitalize",
      });
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", `${process.env.NEXT_PUBLIC_CLOUDINARY_APP}`);
      data.append(
        "cloud_name",
        `${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME}`
      );
      fetch(`${process.env.NEXT_PUBLIC_CLOUDINARY_CREDS}`, {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setImage(data.url.toString());
          toast.success(`Successfully uploaded image.`, {
            id: toastId,
            className: "capitalize",
          });
          setImage(data.url.toString());
        })
        .catch((err) => {
          console.log(err);
          toast.error(`${err} `, {
            id: toastId,
            className: "capitalize",
          });
        });
    } else {
      toast.error("Please select image", {
        id: toastId,
        className: "capitalize",
      });
      return;
    }
  };

  //realtime watch for when th eprofile is updated
  useEffect(() => {
    if (id) {
      const unsub = onSnapshot(doc(db, "users", `${id}`), (doc) => {
        setData(doc.data());
        console.log("sdfersfes");
      });
      return unsub;
    }
  }, [id]);
  const handleSubmit = async () => {
    const toastId = toast.loading("Loading..");
    //console.log({ ...inputs, image });
    if (id) {
      const docRef = doc(db, "users", `${id}`);
      const filteredBody = Object.keys(inputs).reduce((user, key) => {
        if (inputs[key].length > 0) {
          user[key] = inputs[key];
        }
        return user;
      }, {});
      let da = { ...filteredBody };
      if (image) {
        da = { ...da, image };
      }
      // const d = {
      //   ...filteredBody,
      //   image ,
      // };
      updateDoc(docRef, da)
        .then((docRef) => {
          toast.success("Successfully updated contact", {
            id: toastId,
            className: "capitalize",
          });
          console.log("updated user:", docRef);
          // listening to the realtime doc update
          onSnapshot(doc(db, "users", `${id}`), (doc) => {
            setData(doc.data());
          });

          // localStorage.setItem(
          //   "chaty_pals_user",
          //   JSON.stringify(docSnap.data())
          // );
          // dispatch({ type: "LOGIN", payload: docSnap.data() });
        })
        .catch((error) => {
          console.log(error);
          toast.error(`${error}`, {
            id: toastId,
            className: "capitalize",
          });
        });
      // const upd = await updateDoc(docRef, { ...inputs, image });
      // localStorage.setItem("chaty-app-user", JSON.stringify(upd.data()));
      // setProfile(upd.data());
    }
  };

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-screen-xl  px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid   grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-5">
          <div className="lg:col-span-2      ">
            {/* Profile card starts here */}
            <div className="flex flex-col    mb-8 justify-start shadow-md rounded-xl sm:px-12 dark:bg-gray-900 dark:text-gray-100">
              <img
                src={
                  data && data.image
                    ? data.image
                    : "https://source.unsplash.com/150x150/?portrait?3"
                }
                alt=""
                className="w-32 h-32 mx-auto rounded-full dark:bg-gray-500 aspect-square"
              />
              <div className="space-y-4 text-center divide-y divide-gray-700">
                <div className="my-2 space-y-1">
                  <h2 className="text-xl font-semibold sm:text-2xl">
                    {data && data.username ? data.username : "User Name"}
                  </h2>
                  <p className="px-5 text-xs sm:text-base dark:text-gray-400">
                    {data && data.position ? data.position : "Postion"}
                  </p>
                </div>
              </div>
            </div>
            {/* Profile card ends here */}
            <p className="max-w-xl px-4 text-lg">
              {data && data.desc ? data.desc : "Desrciption"}
            </p>

            <div className="mt-8 px-4">
              <a href="" className="text-2xl font-bold text-pink-600">
                {data && data.mobile ? data.mobile : "+1 000 000 000"}
              </a>

              <address className="mt-2 not-italic">
                {data && data.location ? data.location : "Location"}
              </address>
            </div>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
            <div className="space-y-4">
              <div>
                <input
                  className="w-full rounded-lg border-gray-200 p-4 border  text-sm"
                  placeholder="Username"
                  type="text"
                  value={inputs.username}
                  onChange={(e) =>
                    setInputs({ ...inputs, username: e.target.value })
                  }
                  id="name"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <input
                    className="w-full rounded-lg border-gray-200  p-4 border text-sm"
                    placeholder="Position"
                    value={inputs.position}
                    onChange={(e) =>
                      setInputs({ ...inputs, position: e.target.value })
                    }
                    type="text"
                  />
                </div>

                <div>
                  <input
                    className="w-full rounded-lg border-gray-200  p-4 border text-sm"
                    placeholder={data && data.email}
                    type="email"
                    value={inputs.email}
                    onChange={(e) =>
                      setInputs({ ...inputs, email: e.target.value })
                    }
                    id="email"
                  />
                </div>
                <div>
                  <input
                    className="w-full rounded-lg border-gray-200  p-4 border text-sm"
                    placeholder="Mobile Number"
                    type="tel"
                    value={inputs.mobile}
                    onChange={(e) =>
                      setInputs({ ...inputs, mobile: e.target.value })
                    }
                    id="phone"
                  />
                </div>
              </div>
              <div>
                <input
                  className="w-full rounded-lg border-gray-200 p-4 border  text-sm"
                  placeholder="Location"
                  type="text"
                  value={inputs.location}
                  onChange={(e) =>
                    setInputs({ ...inputs, location: e.target.value })
                  }
                  id="name"
                />
              </div>
              <div>
                <textarea
                  className="w-full rounded-lg border-gray-200 p-4 border text-sm"
                  placeholder="Bio"
                  value={inputs.desc}
                  onChange={(e) =>
                    setInputs({ ...inputs, desc: e.target.value })
                  }
                  rows="8"
                ></textarea>
              </div>
              <fieldset className="w-full  ">
                <div className="flex w-full">
                  <input
                    type="file"
                    name="files"
                    id="files"
                    onChange={(e) => postImage(e.target.files[0])}
                    className="px-8 py-12 border-2 border-dashed rounded-md dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800"
                  />
                </div>
              </fieldset>
              <div className="mt-4">
                <button
                  type="submit"
                  onClick={() => {
                    handleSubmit();
                  }}
                  className="inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto"
                >
                  Update Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </section>
  );
}
