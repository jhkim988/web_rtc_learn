import React, { useRef, useEffect, useState } from "react";
import { Peer } from "peerjs";
export const WebRTCContext = React.createContext();

// random hex string function
const randomHexString = (length) => {
  const str = Math.random().toString(16).substr(2, length);
  return str;
};

const WebRTCConnectProvider = ({ children }) => {
  const peerRef = useRef();
  const [peerId, setPeerId] = useState("");
  useEffect(() => {
    if (peerRef.current) return;
    peerRef.current = new Peer(randomHexString(4));
    peerRef.current.on("open", id => {
      console.log("peer open: ", id);
      setPeerId(id);
    });
  }, []);

  return <WebRTCContext.Provider value={{ peer: peerRef.current, peerId }}>
    {children}
  </WebRTCContext.Provider>;
}

export default WebRTCConnectProvider;