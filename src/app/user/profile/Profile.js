"use client";
import { useAuthContext } from "@/context/AuthContext";
import Edit from "@/pages/Edit";
import React from "react";

export default function Profile() {
  const { user } = useAuthContext();
  return (
    <div>
      <Edit id={user.uid} />
    </div>
  );
}
