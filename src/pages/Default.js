"use client";
import React, { useEffect, useState } from "react";
import no_user from "@/assets/pages/no_user.png";
import {
  HiOutlineChatBubbleLeftEllipsis,
  HiOutlineUsers,
} from "react-icons/hi2";
import Sidebarr from "@/layout/Sidebarr";
import { FiSearch } from "react-icons/fi";
import {
  BsArrowBarLeft,
  BsArrowBarRight,
  BsSend,
  BsThreeDotsVertical,
} from "react-icons/bs";
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
import chat_prompt from "@/assets/pages/chat.jpg";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
export default function Default() {
  const [activeChat, setActiveChat] = useState({});
  const [closeSidebar, setCloseSidebar] = useState(false);
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
  const [messages, setMessages] = useState([]);
  const [requestedToChat, setRequestedToChat] = useState({});

  const refuseUnAuthorizedUsers = () => {
    const toastId = toast.loading("Checking authentication");
    if (!user) {
      setTimeout(() => {
        toast.error("Please login first", {
          id: toastId,
        });
      }, 3000);
      setTimeout(() => {
        router.push("/user/signin");
      }, 5000);
    }
    setTimeout(() => {
      toast.dismiss();
    }, 5000);
  };
  useEffect(() => {
    refuseUnAuthorizedUsers();
  }, [user]);
  //formating timestamps
  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  const formatTimestamp = (timestamp) => {
    const messageTime = new Date(timestamp);
    const currentTime = new Date();

    if (isSameDay(messageTime, currentTime)) {
      return `${messageTime.toLocaleTimeString()}`; // Display only time
    } else {
      return `${messageTime.toLocaleDateString()}, ${messageTime.toLocaleTimeString()}`; // Display both date and time
    }
  };
  //fecthing messages in realtime
  useEffect(() => {
    if (!headerInfo.chat_id) {
      return; // Don't fetch if chat_id is missing
    }

    const msgsRef = collection(db, "msgs");
    const chatDocRef = doc(db, "chats", headerInfo.chat_id);

    // Create a query to filter messages by the chat ID
    const chatMessagesQuery = query(
      msgsRef,
      where("chat_id", "==", headerInfo.chat_id)
    );

    // Set up a real-time listener to fetch messages
    const unsubscribe = onSnapshot(chatMessagesQuery, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        const messageData = doc.data();
        messages.push({ id: doc.id, ...messageData });
      });

      // Sort messages by timestamp in ascending order
      messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      setMessages(messages);

      // Update latest_time_in based on the newest message's timestamp
      // if (messages.length > 0) {
      //   const latestTimestamp = messages[messages.length - 1].timestamp;
      //   updateLatestIncomingTimestamp(chatDocRef, latestTimestamp);
      // }
    });

    // Remember to unsubscribe the listener when the component unmounts
    return () => unsubscribe();
  }, [headerInfo.chat_id]);

  //fetching the current user from database
  //realtime watch for when th eprofile is updated
  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "users", `${user.uid}`), (doc) => {
        setData(doc.data());
        //console.log("sdfersfes");
      });
      return unsub;
    }
  }, [user]);
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
    req_name,
    req_image,
    requester,
    accepter,
    acc_name,
    acc_image,
    req_latest_msg,
  }) => {
    const chatsRef = collection(db, "chats");

    // Check if the chat already exists with the given requester and accepter
    const chatQuery = query(
      chatsRef,
      where("requester", "==", `${requester}`),
      where("accepter", "==", `${accepter}`)
    );

    const chatQuerySnapshot = await getDocs(chatQuery);

    // If no chat document exists, create one
    if (chatQuerySnapshot.size === 0) {
      const newChatDocRef = await addDoc(chatsRef, {
        req_name: req_name,
        req_image: req_image,
        requester: requester,
        accepter: accepter,
        acc_name: acc_name,
        acc_image: acc_image,
        latest_msg: req_latest_msg,
      });
      // Get the ID of the newly created chat document
      const newChatId = newChatDocRef.id;

      // Update the chat document with the chat_id field
      await updateDoc(newChatDocRef, {
        chat_id: newChatId,
      });
    } else {
      // Chat document already exists, handle as needed
      console.log("Chat already exists");
    }
  };

  //fetching chats

  const sendMessage = async () => {
    const timestamp = new Date();
    try {
      const msgData = {
        msg,
        chat_id: headerInfo.chat_id, // Assuming headerInfo.chat_id is the document ID
        sender_image: data.image,
        receiver_image: headerInfo.acc_image,
        sender_id: data.id,
        timestamp: timestamp.toISOString(),
      };

      // Send the message
      await addDoc(collection(db, "msgs"), msgData);

      // Update the latest message in the chat
      const docRef = doc(db, "chats", headerInfo.chat_id);
      await updateDoc(docRef, {
        latest_msg: msg,
        latest_time_in: timestamp.toISOString(),
      });

      // Clear the message input field
      setMsg("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
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
          return userr.id !== user.uid;
        });
        setContacts(arrayWithoutCurrentUser);
      });
    }
  }, [user]);

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

  return (
    <div className="overflow-clip  p-1 flex justify-between ">
      {/* Sidebar starts here*/}
      <div
        style={{
          borderRight: "2px solid lightgray",
        }}
        className="sticky p-2   top-0 h-[100vh]"
      >
        <button
          onClick={() => setCloseSidebar(!closeSidebar)}
          className="p-2 rounded-md m-2 border  border-black   ml-auto hover:bg-black hover:text-white"
        >
          {closeSidebar ? <BsArrowBarRight /> : <BsArrowBarLeft />}
        </button>
        {!closeSidebar && (
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
                                            req_name: data.username,
                                            req_image: data.image,
                                            requester: user.uid,
                                            accepter: id,
                                            acc_name: username,
                                            acc_image: image,
                                            req_latest_msg:
                                              "Hey there. Let's chat",
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
                          chats.map((d, i) => (
                            <div
                              onClick={() => {
                                setIsChatInView(true);
                                setHeaderInfo(d);
                              }}
                              key={i}
                              style={{
                                padding: 5,
                                cursor: "pointer",
                                borderRadius: 10,
                              }}
                              className="flex    w-full justify-between cursor-pointer hover:bg-gray-100"
                            >
                              <div className="flex  ">
                                {" "}
                                <img
                                  style={{
                                    width: 40,
                                    marginRight: 6,
                                    borderRadius: 10,
                                    height: 40,
                                  }}
                                  alt="No Avatar"
                                  src={
                                    d && user && user.uid === d.requester
                                      ? d.acc_image
                                      : d.req_image
                                  }
                                />
                                <div>
                                  <h6 className="font-bold">
                                    {d && user.uid === d.requester
                                      ? d.acc_name
                                      : d.req_name}
                                  </h6>
                                  <p className="text-xs w-36 truncate">
                                    {(d && d.latest_msg) ||
                                      "Send the first message"}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs mt-auto ">
                                {" "}
                                {formatTimestamp(d.latest_time_in)}
                              </p>
                            </div>
                          ))
                        )

                        ////////////////////////////////
                      }
                    </div>
                  </>
                )}

                {activeTab === "contacts" &&
                  contacts.map((d, i) => (
                    <div
                      onClick={() => {
                        setIsChatInView(false);
                        setHeaderInfo(d);
                      }}
                      key={i}
                      style={{
                        padding: 5,
                        cursor: "pointer",
                        borderRadius: 10,
                      }}
                      className="flex group items-center justify-between  mb-1 cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <img
                          style={{
                            width: 40,
                            marginRight: 6,
                            borderRadius: 10,
                            height: 40,
                          }}
                          src={d.image}
                        />
                        <div>
                          <h6 className="font-bold">
                            {d.username ? d.username : d.email}
                          </h6>
                          <p className="text-xs">
                            {d.position ? d.position : d.id}
                          </p>
                        </div>
                      </div>
                      <div
                        onClick={() =>
                          createChat({
                            req_name: data.username,
                            req_image: data.image,
                            requester: user.uid,
                            accepter: d.id,
                            acc_name: d.username,
                            acc_image: d.image,
                            req_latest_msg: "Hi there. Can we chat",
                          })
                        }
                        className="hidden group-hover:block"
                      >
                        <BsSend />
                      </div>
                    </div>
                  ))}
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
                    {tab.charAt(0).toLocaleUpperCase() +
                      tab.slice(1, tab.length)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Sidebar ends here */}
      {/* Message view div starts here */}
      <div style={{ width: "100%" }} className="  ">
        {/* Header starts here */}
        {/* checking if there is a selected chat */}
        {headerInfo && headerInfo.chat_id && activeTab === "chats" ? (
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
            {headerInfo && headerInfo.chat_id && (
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
                  src={
                    headerInfo && headerInfo.requester
                      ? headerInfo.requester === user.uid
                        ? headerInfo.acc_image
                          ? headerInfo.acc_image
                          : no_user.src
                        : headerInfo.req_image
                        ? headerInfo.req_image
                        : no_user.src
                      : headerInfo.image
                      ? headerInfo.image
                      : no_user.src
                  }
                  alt="no image"
                />
                <div>
                  <h6 className="font-bold">
                    {headerInfo && headerInfo.requester
                      ? headerInfo.requester === user.uid
                        ? headerInfo.acc_name
                        : headerInfo.req_name
                      : headerInfo.username
                      ? headerInfo.username
                      : headerInfo.email}
                  </h6>
                  <p>{headerInfo.uid}</p>
                  <p className="text-xs">
                    {" "}
                    {headerInfo && headerInfo.requester
                      ? "Online"
                      : headerInfo.position
                      ? headerInfo.position
                      : "Position"}
                  </p>
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
        ) : (
          <>
            {activeChat === "chats" && (
              <div className="w-fit flex flex-col mt-32 items-center mx-auto">
                <img width={300} src={chat_prompt.src} />
                <h1 className="text-2xl font-bold text-gray-300">
                  Select a chat on the leftbar to start chatting
                </h1>
              </div>
            )}
          </>
        )}
        {/* Header ends here */}
        {/* Actual Messages */}
        {!isChatInView ? (
          <>{activeTab === "contacts" && <Edit id={headerInfo.id} />}</>
        ) : (
          <div
            style={{
              width: "100%",
              height: "auto",
            }}
            className="  p-[50px] "
          >
            {messages &&
              messages.map((c, i) => (
                <div
                  className="flex h-full   items-start justify-between"
                  style={
                    user.uid === c.sender_id
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
                  <div className=" ">
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
                    <p className="lg:ml-auto font-medium lg:w-fit">
                      {formatTimestamp(c.timestamp)}
                    </p>
                  </div>
                  {i === 0 && (
                    <img
                      style={{ width: 50, height: 50, borderRadius: "100%" }}
                      src={c.sender_image}
                    />
                  )}
                  {c &&
                    c.sender_id &&
                    messages &&
                    messages[i - 1] &&
                    messages[i - 1] &&
                    messages[i - 1].sender_id &&
                    c.sender_id != messages[i - 1].sender_id && (
                      <img
                        style={{ width: 50, height: 50, borderRadius: "100%" }}
                        src={c.sender_image}
                      />
                    )}
                </div>
              ))}
          </div>
        )}
        {isChatInView && headerInfo && headerInfo.chat_id ? (
          <div className="flex flex-row items-center fixed bottom-2 right-2 h-16 rounded-xl bg-white  w-[calc(100%-20rem)] px-4">
            <div className="flex-grow ml-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Type your message here"
                  className="flex w-full border rounded-xl focus:outline-none focus:border-green-600 p-4 pl-4 h-12"
                />
              </div>
            </div>
            <div className="ml-4">
              <button
                onClick={() => sendMessage()}
                className="flex items-center justify-center bg-green-600 p-2 hover:bg-indigo-600 rounded-xl text-white px-4  flex-shrink-0"
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
        ) : (
          <>
            {activeTab === "chats" && (
              <div className="w-fit mx-auto pt-20 flex flex-col items-center">
                <img width={300} src={chat_prompt.src} />
                <h1 className="text-2xl text-gray-400">
                  Select a desired chat and enjoy
                </h1>
              </div>
            )}
          </>
        )}
      </div>
      {/* Message view div ends here */}
    </div>
  );
}
