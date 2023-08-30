"use client";
import React, { useEffect, useState } from "react";
import { BiSolidUserCircle } from "react-icons/bi";
import {
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineUsers,
} from "react-icons/hi2";
import Sidebarr from "@/layout/Sidebarr";
import { FiSearch } from "react-icons/fi";
import { BsSend, BsThreeDotsVertical } from "react-icons/bs";
import { useRouter } from "next/navigation";
import Edit from "./Edit";
import { auth, db } from "@/app/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useAuthContext } from "@/context/AuthContext";
export default function Default() {
  const [activeChat, setActiveChat] = useState({});
  const [activeContact, setActiveContact] = useState({});
  const [isChatInView, setIsChatInView] = useState(true);
  const { dispatch, user } = useAuthContext();
  const [data, setData] = useState({});
  const [headerInfo, setHeaderInfo] = useState({});
  const [activeProfile, setActiveProfile] = useState(null);
  const [searchedChats, setSearchedChats] = useState([]);
  const [msg, setMsg] = useState("");
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const q = query(collection(db, "users"));
  const [requestedToChat, setRequestedToChat] = useState({});

  const fetchSearchedChats = async () => {
    const q = query(
      collection(db, "users"),
      where("username", "==", `${search}`)
    );
    onSnapshot(q, (querySnapshot) => {
      let users = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });
      setSearchedChats(users);
    });
  };
  useEffect(() => {
    fetchSearchedChats();
  }, [search]);

  //fetching chats that belong to a logged in user
  const fetchChats = async () => {
    if (user) {
      const q = query(collection(db, "chats"));
      onSnapshot(q, (querySnapshot) => {
        let chats = [];
        querySnapshot.forEach((doc) => {
          chats.push(doc.data());
        });
        console.log(chats);
        let user_s_chats = [];
        chats.forEach((d) => {
          if (d.requester === user.uid || d.accepter === user.uid) {
            user_s_chats.push(d);
          }
        });
        setChats(user_s_chats);
        console.log(user_s_chats);
      });
    }
  };
  useEffect(() => {
    fetchChats();
  }, [user]);

  //realtime watch for when th eprofile is updated

  const createChat = async ({
    req__chat_name,
    req__chat_image,
    req__chat_id,
    req__id,
    req__requester,
    req__accepter,
    req__latest_msg,
  }) => {
    if (req__accepter) {
      //this is a first time chat request
      await addDoc(collection(db, "chats"), {
        chat_name: `${req__chat_name}`,
        chat_image: `${req__chat_image}`,
        chat_id: `${req__chat_id}`,
        id: `${req__id}`,
        requester: `${req__requester}`,
        accepter: `${req__accepter}`,
        latest_msg: `${req__latest_msg}`,
      });
    } else {
      if (requestedToChat.id) {
        await addDoc(collection(db, "chats"), {
          chat_name: `${requestedToChat.username}`,
          id: `${requestedToChat.id}`,
          position: `${requestedToChat.position}`,
          accepter: `${requestedToChat.id}`,
          requester: `${user._id}`,
          chat_image: `${requestedToChat.image}`,
        });
      }
    }
  };
  const sendMessage = async () => {
    await addDoc(collection(db, "msgs"), {
      msg,
      chat_id: `${activeChat.id}`,
      sender_image: `${user.image}`,
      sender_id: `${user.id}`,
    });
    setMsg("");
    //updating the latest message in the chat
    const docRef = doc(db, "chats", `${activeChat.id}`);
    updateDoc(docRef, { latest_msg: msg })
      .then((docRef) => {})
      .catch((error) => {});
  };

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "users"));
      onSnapshot(q, (querySnapshot) => {
        let users = [];
        querySnapshot.forEach((doc) => {
          users.push(doc.data());
        });
        const arrayWithoutCurrentUser = users.filter(function (userr) {
          return userr.id !== user.id;
        });
        setContacts(arrayWithoutCurrentUser);
      });
    }
  }, [user]);
  //add item to data
  const addItem = async (e) => {
    e.preventDefault();
  };
  //read items from database
  //delete items from database
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

  // const chats = [
  //   {
  //     chat_name: "Kimberly Houghston",
  //     id: "123",
  //     position: "Doctor",
  //     msgs: [
  //       {
  //         msg: "As well as their work with top tier artists, Internet Money have been focused on developing acts, such as iann dior, POORSTACY and pop-singer Alec Wigdahl.",
  //         sender_image:
  //           "https://img.freepik.com/free-vector/illustrator-designer-man-holding-digital-tablet_107791-12062.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //         id: "12",
  //         sender_id: "321",
  //       },
  //       {
  //         msg: "In 2020, the collective offered up B4 the Storm, featuring an array of artists including Future, Lil Tecca, the Kid LAROI, Swae Lee, and many more. A single, ",
  //         sender_image:
  //           "https://img.freepik.com/free-vector/illustrator-designer-man-holding-digital-tablet_107791-12062.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //         id: "12",
  //         sender_id: "321",
  //       },
  //       {
  //         msg: "Another Coco",
  //         id: "2",
  //         sender_image:
  //           "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //         sender_id: "123",
  //       },
  //       {
  //         msg: "Message",
  //         id: "1",
  //         sender_image:
  //           "https://img.freepik.com/free-vector/illustrator-designer-man-holding-digital-tablet_107791-12062.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //         sender_id: "321",
  //       },
  //       {
  //         msg: "Another Message",
  //         sender_image:
  //           "https://img.freepik.com/free-vector/illustrator-designer-man-holding-digital-tablet_107791-12062.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //         id: "182",
  //         sender_id: "321",
  //       },
  //       {
  //         msg: "Another Coco",
  //         id: "129",
  //         sender_image:
  //           "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //         sender_id: "123",
  //       },
  //     ],
  //     chat_image:
  //       "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //     peers: [
  //       {
  //         name: "John Kingstone",
  //         image:
  //           "https://img.freepik.com/free-vector/illustrator-designer-man-holding-digital-tablet_107791-12062.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //         id: "321",
  //       },
  //       {
  //         name: "Kimberly Houghston",
  //         image:
  //           "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //         id: "123",
  //       },
  //     ],
  //   },
  //   {
  //     chat_name: "Larry",
  //     id: "13",
  //     position: "Developer",
  //     msgs: [1, 2, 3, 4, "Ayoh"],
  //     chat_image:
  //       "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //     peers: [
  //       {
  //         name: "John Kingstone",
  //         image:
  //           "https://img.freepik.com/free-vector/illustrator-designer-man-holding-digital-tablet_107791-12062.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //         id: "321",
  //       },
  //       {
  //         name: "Larry",
  //         image:
  //           "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.2.472706870.1686005450&semt=sph",
  //         id: "13",
  //       },
  //     ],
  //   },
  // ];
  return (
    <div className="overflow-clip  p-1 flex justify-between ">
      {/* Sidebar starts here*/}
      <div
        style={{
          borderRight: "2px solid lightgray",
        }}
        className="sticky p-2  top-0 h-[100vh]"
      >
        <div style={{}} className=" -mt-1 ">
          <div className="flex items-center">
            {" "}
            <input
              type="text "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: 10, padding: 8 }}
              className="border rounded-full"
            />
            <button
              style={{
                borderRadius: 10,
                marginLeft: 10,
                padding: 8,
              }}
              className="hover:bg-gray-100      bg-gray-50"
            >
              <FiSearch
                style={{ width: 30, height: 30 }}
                className=" text-[#2ED06E]"
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
              {activeTab === "chats" && (
                <>
                  <div>
                    {/* If the chat tab is on */}
                    {
                      chats && chats.length === 0 ? (
                        <>
                          <p>Search a contact and start chatting</p>:
                          <div>
                            {/* If there are no chats */}
                            {searchedChats.length <= 0 ? (
                              <div className="flex flex-col items-center">
                                <img
                                  className="w-56 -ml-8"
                                  src="https://img.freepik.com/free-vector/curious-concept-illustration_114360-2185.jpg?size=626&ext=jpg&uid=R86751016&ga=GA1.1.472706870.1686005450&semt=ais"
                                />
                                <p className="text-2xl text-gray-400 font-medium">
                                  No Contact found
                                </p>
                              </div>
                            ) : (
                              <div>
                                {" "}
                                {searchedChats.map(
                                  ({
                                    username,
                                    image,
                                    id,
                                    position,
                                    desc,
                                    email,
                                    mobile,
                                  }) => (
                                    <div
                                      onClick={() => {
                                        setActiveChat({
                                          username,
                                          image,
                                          id,
                                          position,
                                          desc,
                                          email,
                                          mobile,
                                        });
                                        setIsChatInView(true);
                                        createChat({
                                          username,
                                          image,
                                          id,
                                          position,
                                          desc,
                                          email,
                                          mobile,
                                        });
                                        setRequestedToChat({
                                          username,
                                          image,
                                          id,
                                          position,
                                          desc,
                                          email,
                                          mobile,
                                        });
                                        setHeaderInfo({
                                          username,
                                          image,
                                          id,
                                          position,
                                          desc,
                                          email,
                                          mobile,
                                        });
                                      }}
                                      key={id}
                                      style={{
                                        padding: 5,
                                        cursor: "pointer",
                                        borderRadius: 10,
                                      }}
                                      className="flex    cursor-pointer hover:bg-gray-100"
                                    >
                                      <img
                                        style={{
                                          width: 40,
                                          marginRight: 6,
                                          borderRadius: 10,
                                          height: 40,
                                        }}
                                        src={image}
                                      />
                                      <div>
                                        <h6 className="font-bold">
                                          {username}
                                        </h6>
                                        <p>{position}</p>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                            {/* If the chat tab is on ends here */}
                          </div>
                        </>
                      ) : (
                        chats.map(
                          ({
                            chat_name,
                            id,
                            peers,
                            msgs,
                            latest_msg,
                            position,
                            chat_image,
                          }) => (
                            <div
                              onClick={() => {
                                setActiveChat({
                                  chat_name,
                                  id,
                                  msgs,
                                  position,
                                  chat_image,
                                  peers,
                                });
                                setIsChatInView(true);
                                setHeaderInfo({
                                  chat_name,
                                  id,
                                  peers,
                                  msgs,
                                  position,
                                  chat_image,
                                });
                              }}
                              key={id}
                              style={{
                                padding: 5,
                                cursor: "pointer",
                                borderRadius: 10,
                              }}
                              className="flex    cursor-pointer hover:bg-gray-100"
                            >
                              <img
                                style={{
                                  width: 40,
                                  marginRight: 6,
                                  borderRadius: 10,
                                  height: 40,
                                }}
                                alt="No Avatar"
                                src={chat_image}
                              />
                              <div>
                                <h6 className="font-bold">{chat_name}</h6>
                                <p className="text-xs">
                                  {latest_msg || "Send the first message"}
                                </p>
                              </div>
                            </div>
                          )
                        )
                      )

                      ////////////////////////////////
                    }
                  </div>
                </>
              )}

              {activeTab === "contacts" &&
                contacts.map(
                  ({ username, image, id, position, desc, email, mobile }) => (
                    <div
                      key={id}
                      style={{
                        padding: 5,
                        cursor: "pointer",
                        borderRadius: 10,
                      }}
                      className="flex group items-center justify-between  mb-1 cursor-pointer hover:bg-gray-100"
                    >
                      <div
                        onClick={() => {
                          setIsChatInView(false);
                          setHeaderInfo({
                            username,
                            image,
                            id,
                            desc,
                            position,
                            email,
                            mobile,
                          });
                        }}
                        className="flex items-center"
                      >
                        <img
                          style={{
                            width: 40,
                            marginRight: 6,
                            borderRadius: 10,
                            height: 40,
                          }}
                          src={image}
                        />
                        <div>
                          <h6 className="font-bold">
                            {username ? username : email}
                          </h6>
                          <p className="text-xs">{position ? position : id}</p>
                        </div>
                      </div>
                      <div
                        onClick={() =>
                          createChat({
                            req__chat_name: username,
                            req__chat_image: image,
                            req__chat_id: id,
                            req__id: id,
                            req__requester: user.uid,
                            req__accepter: id,
                            req__latest_msg: "Hi there. Can we chat",
                          })
                        }
                        className="hidden group-hover:block"
                      >
                        <BsSend />
                      </div>
                    </div>
                  )
                )}
            </div>
          </div>
          <div
            style={{ position: "fixed", bottom: 20, gap: 8, left: 14 }}
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
      </div>
      {/* Sidebar ends here */}
      {/* Message view div starts here */}
      <div style={{ width: "100%" }} className="  ">
        {/* Header starts here */}
        <div
          style={{
            borderBottom: "1px solid lightgray",
            paddingLeft: 20,
            paddingRight: 20,
            backgroundColor: "lightgray",
          }}
          className="flex sticky top-0 justify-between"
        >
          {/* Bases on chat details or profile details ;starts here */}
          {headerInfo && (
            <div
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
                src={headerInfo && (headerInfo.chat_image || headerInfo.image)}
              />
              <div>
                <h6 className="font-bold">
                  {headerInfo && (headerInfo.chat_name || headerInfo.username)}
                </h6>
                <p className="text-xs">{headerInfo.position}</p>
              </div>
            </div>
          )}

          {/* Bases on chat details or profile details ;ends here */}
          <button
            style={{ borderRadius: 10, height: 40, width: 40 }}
            className="hover:bg-gray-100  my-auto justify-center flex items-center   "
          >
            <BsThreeDotsVertical />
          </button>
        </div>
        {/* Header ends here */}
        {/* Actual Messages */}
        {!isChatInView ? (
          <Edit id={headerInfo.id} />
        ) : (
          <div
            style={{
              width: "100%",
              height: 800,
              padding: 70,
            }}
            className="p-6  "
          >
            {activeChat &&
              activeChat.msgs &&
              activeChat.msgs.map((c, i) => (
                <div
                  className="flex items-start justify-between"
                  style={
                    activeChat.id != c.sender_id
                      ? {
                          marginLeft: "auto",
                          width: 400,
                          padding: 10,
                          display: "flex",
                          borderRadius: 20,
                          marginBottom: 10,
                        }
                      : {
                          marginRight: "auto",
                          width: 400,
                          padding: 10,
                          borderRadius: 20,
                          flexDirection: "row-reverse",
                          marginBottom: 10,
                        }
                  }
                  key={c.id}
                >
                  <div>
                    <p
                      style={{
                        backgroundColor: "whitesmoke",
                        width: 380,
                        borderRadius: 10,
                        padding: 10,
                      }}
                      className=""
                    >
                      {c.msg}
                    </p>
                    <p className="ml-auto w-fit">12:00am</p>
                  </div>
                  {i === 0 && (
                    <img
                      style={{ width: 50, height: 50, borderRadius: "100%" }}
                      src={c.sender_image}
                    />
                  )}
                  {c &&
                    c.sender_id &&
                    activeChat.msgs &&
                    activeChat.msgs[i - 1] &&
                    activeChat.msgs[i - 1] &&
                    activeChat.msgs[i - 1].sender_id &&
                    c.sender_id != activeChat.msgs[i - 1].sender_id && (
                      <img
                        style={{ width: 50, height: 50, borderRadius: "100%" }}
                        src={c.sender_image}
                      />
                    )}
                </div>
              ))}
          </div>
        )}
        {isChatInView && (
          <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
            <div className="flex-grow ml-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Type your message here"
                  className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 p-4 pl-4 h-10"
                />
              </div>
            </div>
            <div className="ml-4">
              <button
                onClick={() => sendMessage()}
                className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
              >
                <span>Send</span>
                <span className="ml-2">
                  <svg
                    className="w-4 h-4 transform rotate-45 -mt-px"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Message view div ends here */}
    </div>
  );
}
