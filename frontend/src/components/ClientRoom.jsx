import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Canvas from "./Canvas.jsx";
import ChatTab from "./ChatTab.jsx";
import { RiDeleteBinLine } from "react-icons/ri";

import { BsFillPencilFill } from "react-icons/bs";
import { FaLinesLeaning } from "react-icons/fa6";
import { MdOutlineRectangle } from "react-icons/md";
import { PiRectangleDuotone } from "react-icons/pi";
import { ImUndo2 } from "react-icons/im";
import { ImRedo2 } from "react-icons/im";


const Room = ({ socket, setUsers, user, users }) => {
  const canvasRef = useRef(null);
  const ctx = useRef(null);
  const [color, setColor] = useState("black");
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [tool, setTool] = useState("");
  const [openedUserTab, setOpenedUserTab] = useState(false);
  const [openedChatTab, setOpenedChatTab] = useState(false);

  useEffect(() => {
    const handleAllUsers = (updatedUsers) => {
      setUsers(updatedUsers);
    };

    const handleUserLeftMessage = (data) => {
      toast.error(`${data} Left the Room !!!`);
    };

    const handleUserJoinedMessage = (name) => {
      toast.success(`${name} Joined the Room !!!`);
    };

    socket.on("allUsers", handleAllUsers);
    socket.on("userLeftMessage", handleUserLeftMessage);
    socket.on("userJoinedMessage", handleUserJoinedMessage);

    return () => {
      socket.off("allUsers", handleAllUsers);
      socket.off("userLeftMessage", handleUserLeftMessage);
      socket.off("userJoinedMessage", handleUserJoinedMessage);
    };
  }, [socket, setUsers]);

  useEffect(() => {
    return () => {
      socket.emit("userLeftMessage", user.name);
    };
  }, [user, socket]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    setElements([]);
    setHistory([]);
  };

  const undo = () => {
    if (elements.length === 0) return;
    const newHistory = [...history, elements[elements.length - 1]];
    const newElements = elements.slice(0, -1);
    setHistory(newHistory);
    setElements(newElements);
    if (newElements.length === 0) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const redo = () => {
    if (history.length === 0) return;
    const newElements = [...elements, history[history.length - 1]];
    const newHistory = history.slice(0, -1);
    setElements(newElements);
    setHistory(newHistory);
  };

  return (
    <div className="container-fluid pl-0">
      <button
        type="button"
        onClick={() => setOpenedUserTab(true)}
        className="btn btn-dark mt-4 ml-4 pl-4 pr-4"
        style={{ position: "absolute", display: "block" }}
      >
        Users
      </button>
      <button
        type="button"
        onClick={() => setOpenedChatTab(!openedChatTab)}
        className="btn btn-dark mt-4 ml-4 pl-4 pr-4"
        style={{ position: "absolute", display: "block", left: "15vh" }}
      >
        Chats
      </button>
      {openedUserTab && (
        <div
          className="position-fixed top-0 left-0 h-100 bg-dark text-white p-2"
          style={{ width: "200px" }}
        >
          <button
            type="button"
            onClick={() => setOpenedUserTab(false)}
            className="btn btn-light btn-block w-100 mt-5 mb-5"
          >
            Close
          </button>
          {users.map((usr, index) => (
            <p className="text-center w-100" key={index}>
              {usr.name}
              {user && user.userId === usr.userId && " (You)"}
            </p>
          ))}
        </div>
      )}
      {/* ChatTab always present but conditionally displayed */}
      <div style={{ display: openedChatTab ? "block" : "none" }}>
        <ChatTab setOpenedChatTab={setOpenedChatTab} socket={socket} />
      </div>
      <div className="row">
        <h1 className="display-5 pt-4 pb-3 text-center">
          Digital Whiteboard{" "}
          {/* <span className="text-primary" style={{fontSize: '2rem'}}>Users Online: {users?.length}</span> */}
        </h1>
      </div>
      {user?.presenter && (
        <div className="row justify-content-center align-items-center text-center py-2">
          <div className="col-md-2">
            <div className="color-picker d-flex align-items-center justify-content-center">
              Color : &nbsp;
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <div>
              <button
                className={`btn ${tool === "pencil" ? "btn-secondary" : "btn-outline-secondary"}`}
                onClick={() => setTool("pencil")}
              >
                <BsFillPencilFill />
              </button>
              <button
                className={`btn ${tool === "line" ? "btn-secondary" : "btn-outline-secondary"}`}
                style={{margin: '0 10px'}}
                onClick={() => setTool("line")}
              >
                <FaLinesLeaning />
              </button>
              <button
                className={`btn ${tool === "rect" ? "btn-secondary" : "btn-outline-secondary"}`}
                onClick={() => setTool("rect")}
              >
                <PiRectangleDuotone />
              </button>
            </div>
          </div>

          <div className="col-md-2">
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={elements.length === 0}
              onClick={undo}
            >
              <ImUndo2 />
            </button>
            &nbsp;&nbsp;
            <button
              type="button"
              className="btn btn-outline-primary ml-1"
              disabled={history.length === 0}
              onClick={redo}
            >
              <ImRedo2 />
            </button>
          </div>
          <div className="col-md-1">
            <div className="color-picker d-flex align-items-center justify-content-center">
              <button
                type="button"
                className="btn btn-danger"
                onClick={clearCanvas}
              ><RiDeleteBinLine /></button>
            </div>
          </div>
          <div className="col-md-1">
            <div className="color-picker d-flex align-items-center justify-content-center">
              <input
                type="button"
                className="btn btn-outline-info"
                value={`${users?.length} online`}
                // onClick={}
              />
            </div>
          </div>
        </div>
      )}
      <div className="row">
        <Canvas
          canvasRef={canvasRef}
          ctx={ctx}
          color={color}
          setElements={setElements}
          elements={elements}
          tool={tool}
          socket={socket}
          user={user}
        />
      </div>
    </div>
  );
};

export default Room;
