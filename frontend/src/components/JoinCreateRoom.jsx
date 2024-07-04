import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinCreateRoom = ({ uuid, socket, setUser }) => {
  const [roomId, setRoomId] = useState(uuid());
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const handleCreateRoom = (e) => {
    e.preventDefault();

    const roomData = {
      name,
      roomId,
      userId: uuid(),
      host: true,
      presenter: true,
    };

    setUser(roomData);
    socket.emit("userJoined", roomData);
    console.log("Room created:", roomData);
    navigate(`/${roomId}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();

    const roomData = {
      name: joinName,
      roomId: joinRoomId,
      userId: uuid(),
      host: false,
      presenter: false,
    };

    setUser(roomData);
    socket.emit("userJoined", roomData);
    console.log("Room joined:", roomData);
    navigate(`/${joinRoomId}`);
  };
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <h1 className="text-center my-5">
            Welcome To Realtime Whiteboard Sharing App
          </h1>
        </div>
      </div>
      <div className="row mx-5 mt-5">
        <div className="col-md-5 p-5 border mx-auto">
          <h1 className="text-center text-primary mb-5">Create Room</h1>
          {/* <form onSubmit={handleCreateSubmit}> */}
          <form>
            <div className="form-group my-2">
              <input
                type="text"
                placeholder="Name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="input-group my-2 border align-items-center">
              <input
                type="text"
                className="form-control border-0 outline-0"
                value={roomId}
                disabled
                readOnly={true}
                style={{
                  boxShadow: "none",
                  zIndex: "0 !important",
                  fontsize: "0.89rem !important",
                }}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-primary  border-0 btn-sm"
                  type="button"
                  onClick={() => setRoomId(uuid())}
                >
                  Generate
                </button>
                {/* &nbsp;&nbsp;
                <CopyToClipboard
                  text={roomId}
                //   onCopy={() => toast.success("Room Id Copied To Clipboard!")}
                >
                  <button
                    className="btn btn-outline-dark border-0 btn-sm"
                    type="button"
                  >
                    Copy
                  </button>
                </CopyToClipboard> */}
              </div>
            </div>
            <div className="form-group mt-5">
              <button
                type="submit"
                onClick={handleCreateRoom}
                className="form-control btn btn-dark"
              >
                Create Room
              </button>
            </div>
          </form>
        </div>
        <div className="col-md-5 p-5 border mx-auto">
          <h1 className="text-center text-primary mb-5">Join Room</h1>
          {/* <form onSubmit={handleJoinSubmit}> */}
          <form>
            <div className="form-group my-2">
              <input
                type="text"
                placeholder="Name"
                className="form-control"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
              />
            </div>
            <div className="form-group my-2">
              <input
                type="text"
                className="form-control outline-0"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Room Id"
                style={{
                  boxShadow: "none",
                }}
              />
            </div>
            <div className="form-group mt-5">
              <button
                type="submit"
                onClick={handleJoinRoom}
                className="form-control btn btn-dark"
              >
                Join Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateRoom;
