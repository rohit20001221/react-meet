import React, { useRef, useState } from "react";
import { Button } from "@material-ui/core";
// import { useHistory } from "react-router-dom";
import "./Home.css";

function Home() {
  // const history = useHistory();
  const roomID = useRef();
  const [disabled, setDisabled] = useState(false);

  const joinRoom = (event) => {
    event.preventDefault();
    setDisabled(true);
    window.location.href = `/room/${roomID.current.value}`;
  };

  const createRoom = () => {
    setDisabled(true);
    fetch("https://rocky-woodland-05850.herokuapp.com/createRoom")
      .then((res) => res.json())
      .then((roomInfo) => {
        window.location.href = `/room/${roomInfo.roomID}`;
      });
  };

  return (
    <div className="home">
      <div className="home__createRoom">
        <Button disabled={disabled} onClick={createRoom}>Create Room</Button>
      </div>
      <div className="home__joinRoom">
        <form onSubmit={joinRoom}>
          <input ref={roomID} placeholder="Enter room ID" type="text" />
          {/* <input placeholder="Enter your name" type="text" /> */}
          <Button disabled={disabled} type="submit">Join Room</Button>
        </form>
      </div>
    </div>
  );
}

export default Home;
