"use client";
import React, { useState } from "react";
import { BiSolidUserCircle } from "react-icons/bi";
import {
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineUsers,
} from "react-icons/hi2";

import { FiSearch } from "react-icons/fi";
export default function Sidebarr({ chats }) {
  const tabs = [
    {
      icon: (
        <HiOutlineChatBubbleLeftEllipsis style={{ width: 30, height: 30 }} />
      ),
      tab: "chats",
    },
    {
      icon: <HiOutlineUsers style={{ width: 30, height: 30 }} />,
      tab: "contacts",
    },
  ];
  const [activeTab, setActiveTab] = useState("chats");
  return (
    <div
      style={{ borderRight: "2px solid lightgray", height: "100vh" }}
      className="  p-4"
    >
      <div className="flex items-center">
        {" "}
        <div style={{ borderRadius: 10, padding: 8 }}>
          <HiOutlineChatBubbleLeftEllipsis
            style={{ width: 40, height: 40 }}
            className=" text-gray-100"
          />
        </div>
        <input
          type="text "
          style={{ borderRadius: 10, padding: 8 }}
          className="border rounded-full"
        />
        <button
          style={{
            borderRadius: 10,
            marginLeft: 10,
            color: "#2ED06E",
            padding: 8,
          }}
          className="hover:bg-gray-100      bg-gray-50"
        >
          <FiSearch
            style={{ width: 30, height: 30 }}
            className=" text-gray-100"
          />
        </button>
      </div>
      {/* Center div */}
      <div style={{ padding: 10 }}>
        <h4 style={{ fontWeight: "bold", fontSize: 24 }}>
          {activeTab.charAt(0).toUpperCase() +
            activeTab.slice(1, activeTab.length)}
        </h4>
        <div className="py-4">
          {chats &&
            chats.map(({ chat_name, id, msgs, chat_image }) => (
              <div
                key={id}
                style={{ padding: 5, cursor: "pointer", borderRadius: 10 }}
                className="flex    cursor-pointer hover:bg-gray-100"
              >
                <img
                  style={{
                    width: 40,
                    marginRight: 6,
                    borderRadius: 10,
                    height: 40,
                  }}
                  src={chat_image}
                />
                <div>
                  <h6 className="font-bold">{chat_name}</h6>
                  <p>{msgs[msgs.length - 1]}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div
        style={{ position: "absolute", bottom: 20, gap: 8, left: 14 }}
        className="flex flex-col"
      >
        {tabs.map(({ tab, icon }) => (
          <button
            onClick={() => setActiveTab(tab)}
            key={tab}
            style={
              activeTab === tab
                ? {
                    border: "1px solid lightgray",
                    borderRadius: 10,
                    marginLeft: 10,
                    color: "#2ED06E",
                    padding: 8,
                  }
                : {
                    borderRadius: 10,
                    marginLeft: 10,
                    color: "#2ED06E",
                    padding: 8,
                  }
            }
            className="hover:bg-gray-100 flex  gap-2  text-center rounded-full     bg-gray-100"
          >
            {icon}
            <p>
              {tab.charAt(0).toLocaleUpperCase() + tab.slice(1, tab.length)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
