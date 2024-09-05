import React, { useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import { ToastContainer, toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { app } from "../../firebase";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  doc,
  orderBy,
  getDoc,
  query,
  serverTimestamp,
} from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import "./chat.css";
const db = getFirestore(app);

const AdminChat = () => {
  const { t } = useTranslation(["chat"]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isAuthor, setIsAuthor] = useState(false);
  const [userData, setUserData] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userDataFromLocalStorage = JSON.parse(
      localStorage.getItem("userData")
    );

    if (
      userDataFromLocalStorage &&
      (userDataFromLocalStorage.role === "admin" ||
        userDataFromLocalStorage.role === "superadmin")
    ) {
      setIsAuthor(true);
      setUserData(userDataFromLocalStorage);
    } else {
      setIsAuthor(false);
      setUserData(null);
    }

    const messagesCollection = collection(db, "messages");
    const q = query(messagesCollection, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
      );
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      const userDataFromLocalStorage = JSON.parse(
        localStorage.getItem("userData")
      );
      const avatarUrl =
        userDataFromLocalStorage?.avatar ||
        "https://tse4.mm.bing.net/th?id=OIP.bA3p-H-IWJA7ER6GEOdgsAHaJI&pid=Api&P=0&h=220";
      await addDoc(collection(db, "messages"), {
        text: input,
        timestamp: serverTimestamp(),
        senderName: userDataFromLocalStorage.fullname,
        avatar: avatarUrl,
      });
      setInput("");
    }
  };

  const deleteMessage = async (messageId) => {
    if (isAuthor) {
      await deleteDoc(doc(db, "messages", messageId));
      toast.success(t("messageDeletedSuccessfully"));
    }
  };

  const pinMessage = async (messageId) => {
    if (isAuthor) {
      const messageRef = doc(db, "messages", messageId);
      const messageSnapshot = await getDoc(messageRef);
      const messageData = messageSnapshot.data();

      await updateDoc(messageRef, {
        isPinned: false,
      });

      await addDoc(collection(db, "messages"), {
        ...messageData,
        isPinned: true,
        timestamp: serverTimestamp(),
      });
      await deleteDoc(messageRef);
      toast.success(t("messagePinnedSuccessfully"));
    }
  };

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [confirmModalAction, setConfirmModalAction] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const showConfirmModal = (messageId, action) => {
    setSelectedMessageId(messageId);
    setConfirmModalAction(action);
    setIsConfirmModalVisible(true);
  };

  const handleCancelConfirmModal = () => {
    setSelectedMessageId(null);
    setConfirmModalAction(null);
    setIsConfirmModalVisible(false);
  };

  const handleConfirmModalAction = async () => {
    if (confirmModalAction === "delete") {
      await deleteMessage(selectedMessageId);
    } else if (confirmModalAction === "pin") {
      await pinMessage(selectedMessageId);
    }
    handleCancelConfirmModal();
  };

  return (
    <div className="adminChatContainer">
      <ToastContainer />
      <div className="adminChatHeader">
        <h2>{t("announcement")}</h2>
      </div>
      <div className="chatMessagesContainer">
        {messages.map(({ id, data }) => {
          const userDataFromLocalStorage = JSON.parse(
            localStorage.getItem("userData")
          );
          const isCurrentUser =
            userDataFromLocalStorage &&
            data.senderName === userDataFromLocalStorage.fullname;
          const messageAvatar =
            data.avatar ||
            "https://tse4.mm.bing.net/th?id=OIP.bA3p-H-IWJA7ER6GEOdgsAHaJI&pid=Api&P=0&h=220"; 
          return (
            <div
              key={id}
              className={`chatMessage ${isCurrentUser ? "currentUser" : ""}`}
            >
              <div className={`owner ${isCurrentUser ? "currentUser" : ""}`}>
                <img src={messageAvatar} alt="Avatar" className="avatar" />
                <p>{data.senderName}</p>
                <p>-- {t("admin")}</p>
                {data.timestamp && (
                  <p>
                    {new Date(data.timestamp.seconds * 1000).toLocaleString()}
                  </p>
                )}
              </div>
              <p>{data.text}</p>
              {isCurrentUser && isAuthor && (
                <div className="chatOptions">
                  <button onClick={() => showConfirmModal(id, "delete")}>
                  {t("delete")}
                  </button>
                  <button onClick={() => showConfirmModal(id, "pin")}>
                  {t("pin")}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {userData &&
      (userData.role === "admin" || userData.role === "superadmin") ? (
        <div className="chatInputContainer">
          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder=        {t("typeAMessage")}
            />
            <button type="submit">  {t("send")}</button>
          </form>
        </div>
      ) : (
        <div className="chatInputContainer">
          <p> {t("noPermissionToSendMessage")}</p>
        </div>
      )}
      <Modal
        className="modal"
        title={
          confirmModalAction === "delete"
            ? t("confirmDeleteMessage")
            : t("confirmPinMessage")
        }
        open={isConfirmModalVisible}
        onOk={handleConfirmModalAction}
        onCancel={handleCancelConfirmModal}
      />
    </div>
  );
};

export default AdminChat;
