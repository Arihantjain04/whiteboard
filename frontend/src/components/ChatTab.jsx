import React, { useEffect, useState } from "react";

const ChatTab = ({ setOpenedChatTab, socket }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    const handleMessageResponse = (data) => {
      setChat((prevChats) => [...prevChats, data]);
    };

    socket.on("messageResponse", handleMessageResponse);

    return () => {
      socket.off("messageResponse", handleMessageResponse);
    };
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("message", { message });
      setChat((prevChats) => [...prevChats, { message, name: "You" }]);
      setMessage("");
    }
  };

  return (
    <div
      className="position-fixed top-0 h-100 text-white bg-dark p-4"
      style={{ width: "400px", height: "100%", left: "0%", zIndex: "2" }}
    >
      <button
        type="button"
        onClick={() => setOpenedChatTab(false)}
        className="btn btn-light btn-block w-100 mt-5"
      >
        Close
      </button>
      <div
        className="w-100 h-80 mt-5 p-2 border-1 border-white rounded-0"
        style={{
          border: "2px solid white",
          height: "70%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {chat.map((msg, index) => (
          <div key={index*999} style={{ width: '100%', display: 'flex' }}>
            <p className="text-center w-100">
              {msg.name} : {msg.message}
            </p>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-100 h-80 mt-3 border-1 border-white rounded-0 d-flex align-items-center"
        style={{ border: "2px solid white" }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter Message"
          className="h-100 border-0 outline-0 text-white p-2"
          style={{ width: "90%", background: "transparent", outline: "none" }}
        />
        <button type="submit" className="btn btn-light rounded-0">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatTab;
