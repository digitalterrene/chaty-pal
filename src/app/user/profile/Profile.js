"use client";
import { useAuthContext } from "@/context/AuthContext";
import Edit from "@/pages/Edit";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function Profile() {
  const { user } = useAuthContext();
  const router = useRouter();

  const refuseUnAuthorizedUsers = () => {
    if (!user) {
      router.push("/user/signin");
    }
  };
  useEffect(() => {
    refuseUnAuthorizedUsers();
  }, [user]);
  return <div>{user && <Edit id={user.uid} />}</div>;
}
