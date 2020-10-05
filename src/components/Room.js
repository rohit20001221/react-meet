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
import Peer from "simple-peer";

function Room() {
  const history = useHistory();
  const leaveButton = useRef();
  const toggleVideo = useRef();
  const toggleAudio = useRef();
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const message = useRef();
  const [messages, setMessages] = useState([]);
  const { roomID } = useParams();

  useEffect(() => {
    socketRef.current = io.connect(
      "https://rocky-woodland-05850.herokuapp.com"
    );

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
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

        socketRef.current.emit("join room", roomID);
        socketRef.current.on("msg", (msg) => {
          console.log("message");
          setMessages([...messages, msg]);
        });
        socketRef.current.on("all users", (users) => {
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push(peer);
          });
          setPeers(peers);
        });

        socketRef.current.on("user joined", (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          setPeers((users) => [...users, peer]);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
      });

    // eslint-disable-next-line
  }, [history, roomID]);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const sendMessage = () => {
    socketRef.current.emit("message", message.current.value);
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
            {peers.map((peer, index) => {
              return <VideoStream key={index} peer={peer} />;
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
