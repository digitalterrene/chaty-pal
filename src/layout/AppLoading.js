"use client";
import React, { useState, CSSProperties } from "react";
import { BeatLoader } from "react-spinners";

import logo from "@/assets/layout/logo.png";
export default function AppLoading() {
  const [color, setColor] = useState("#2ED06E");
  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  return (
    <div className="h-screen flex items-center pt-96 justify-center w-screen">
      <div className="flex flex-col items-center mx-auto mt-56">
        <img width={150} src={logo.src} />
        <BeatLoader
          color={color}
          loading={true}
          css={override}
          size={15}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    </div>
  );
}
