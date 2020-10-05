import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { IconButton } from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import CallIcon from "@material-ui/icons/Call";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import SendIcon from "@material-ui/icons/Send";
import Message from "./Message";
import VideoStream from "./VideoStream";
import { useHistory } from "react-router-dom";
import "./Room.css";

import io from "socket.io-client";
import Peer from "peerjs";

function Room() {
  const socket = useRef(io("https://rocky-woodland-05850.herokuapp.com"));
  const peer = useRef(
    new Peer(undefined, {
      host: "peer-18515.herokuapp.com",
      port: "443",
      secure: true,
    })
  );

  const history = useHistory();
  const leaveButton = useRef();
  const toggleVideo = useRef();
  const toggleAudio = useRef();
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const userVideo = useRef();
  const message = useRef();
  const [messages, setMessages] = useState([]);
  const [calls, setCalls] = useState([]);
  const callsRef = useRef([]);
  const { roomID } = useParams();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        peer.current.on("open", (peerID) => {
          socket.current.emit("join-room", roomID, peerID);
        });

        socket.current.on("user-disconnected", (peerID) => {
          console.log("user disconnected !!", peerID);
          const calls_ = [];
          const call = callsRef.current.filter((item) => {
            return item.peer === peerID;
          })[0];

          if (call) {
            call.close();
          }
          callsRef.current = callsRef.current.filter((item) => {
            return item.peer !== peerID;
          });

          callsRef.current.forEach((item) => {
            calls_.push(item);
          });

          setCalls(calls_);
        });

        peer.current.on("call", (call) => {
          call.answer(stream);
          const calls_ = [];
          callsRef.current.push(call);
          callsRef.current.forEach((item) => {
            calls_.push(item);
          });
          setCalls(calls_);
        });

        socket.current.on("user-connected", (userID) => {
          console.log(userID);
          peer.current.connect(userID);
          const call = peer.current.call(userID, stream);
          const calls_ = [];
          callsRef.current.push(call);
          callsRef.current.forEach((item) => {
            calls_.push(item);
          });
          setCalls(calls_);
        });

        userVideo.current.srcObject = stream;
        leaveButton.current.addEventListener("click", () => {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          history.replace("/");
        });

        toggleVideo.current.addEventListener("click", () => {
          stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0]
            .enabled;
          setVideoOn(stream.getVideoTracks()[0].enabled);
        });

        toggleAudio.current.addEventListener("click", () => {
          stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0]
            .enabled;
          setAudioOn(stream.getAudioTracks()[0].enabled);
        });
      });

    return () => {
      socket.current.close();
    };
    // eslint-disable-next-line
  }, [history, roomID]);

  const sendMessage = () => {
    socket.emit("message", message.current.value);
    setMessages([...messages, message.current.value]);
    message.current.value = "";
  };

  return (
    <div className="room">
      <div className="room__interaction">
        <div className="room__interactionStreams">
          <p>Room ID: {roomID}</p>
          <div className="room__interactionStreamsGrid row">
            <div className="videostream col-6">
              <video autoPlay muted ref={userVideo}></video>
            </div>
            {calls.map((call, index) => {
              return <VideoStream key={index} peer={call} />;
            })}
          </div>
        </div>
        <div className="room__interactionPeople">
          <h4>Messages</h4>
          <div className="room__interactionPeopleList">
            {messages.map((msg, i) => {
              return <Message text={msg} key={i} />;
            })}
          </div>
          <div className="room__interactionPeopleMessage">
            <input ref={message} />
            <IconButton onClick={sendMessage}>
              <SendIcon />
            </IconButton>
          </div>
        </div>
      </div>
      <div className="room__controls">
        <IconButton ref={toggleAudio}>
          {audioOn ? (
            <MicIcon className="room__controlsIcon" />
          ) : (
            <MicOffIcon className="room__controlsIcon" />
          )}
        </IconButton>
        <IconButton ref={leaveButton}>
          <CallIcon className="room__controlsIcon red" />
        </IconButton>
        <IconButton ref={toggleVideo}>
          {videoOn ? (
            <VideocamIcon className="room__controlsIcon" />
          ) : (
            <VideocamOffIcon className="room__controlsIcon" />
          )}
        </IconButton>
      </div>
    </div>
  );
}

export default Room;
