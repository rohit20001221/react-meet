import React, { useEffect, useRef } from "react";
import "./VideoStream.css";

function VideoStream({ peer }) {
  const ref = useRef();

  useEffect(() => {
    console.log(peer);
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return (
    <div className="videostream col-6">
      <video autoPlay ref={ref}></video>
    </div>
  );
}

export default VideoStream;
