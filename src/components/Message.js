import React from "react";
import MessageIcon from "@material-ui/icons/Message";
import "./Message.css";

function Message({ text }) {
  return (
    <div className="message">
      <MessageIcon />
      <p>{text}</p>
    </div>
  );
}

export default Message;
