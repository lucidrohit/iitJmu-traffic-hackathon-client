import React from "react";
import { useEffect, useCallback } from "react";
import { useState } from "react";
import { useRef } from "react";
import Webcam from "react-webcam";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function TrackCam() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const webcamRef = useRef(null);
  const capture = useCallback(
    () => webcamRef.current.getScreenshot(),
    [webcamRef]
  );

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    const sendImageInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("image", {
          imgData: capture(),
          location: {
            latitiude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      });
    }, 3000);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("image");
      clearInterval(sendImageInterval);
    };
  }, [capture]);

  return (
    <div>
      <h1>You are {isConnected ? "online" : "offline"}</h1>
      {isConnected ? (
        <Webcam
          audio={false}
          height={720}
          screenshotFormat="image/jpeg"
          width={1280}
          ref={webcamRef}
        />
      ) : null}
    </div>
  );
}

export default TrackCam;
