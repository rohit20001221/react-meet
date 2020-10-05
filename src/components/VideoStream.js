import React, { useEffect, useRef } from "react";
import "./VideoStream.css";

function VideoStream({ peer, muted }) {
  const ref = useRef();

  useEffect(() => {
    console.log(peer);
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return (
    <div className="videostream col-6">
      <video autoPlay muted={muted ? true : false} ref={ref}></video>
    </div>
  );
}

export default VideoStream;
