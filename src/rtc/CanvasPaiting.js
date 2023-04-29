import { useRef, useEffect, useContext, useState } from "react";
import { WebRTCContext } from './WebRTCConnectProvider';
import ConnectPeerList from "./ConnectPeerList";

const CanvasPainting = () => {
  const { peer, peerId: myPeerId } = useContext(WebRTCContext);
  const canvasRef = useRef();
  const ctxRef = useRef();
  const [mouseData, setMouseData] = useState([]);

  const onBeginPath = e => {
    if (!ctxRef.current) return;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.offsetX, e.offsetY);
    canvasRef.current.addEventListener("mousemove", onLineStroke);
    setMouseData({
      method: "beginPath"
      , x: e.offsetX
      , y: e.offsetY
    });
  };

  const onLineStroke = e => {
    if (!ctxRef.current) return;
    ctxRef.current.lineTo(e.offsetX, e.offsetY);
    ctxRef.current.stroke();
    setMouseData({
      method: "lineTo"
      , x: e.offsetX
      , y: e.offsetY
    });
  };

  const onLineEnd = e => {
    if (!ctxRef.current) return;
    canvasRef.current.removeEventListener("mousemove", onLineStroke);
    setMouseData({
      method: "lineEnd"
    });
  };

  useEffect(() => {
    if (ctxRef.current) return;
    ctxRef.current = canvasRef.current.getContext("2d");
    canvasRef.current.addEventListener("mousedown", onBeginPath);
    canvasRef.current.addEventListener("mouseup", onLineEnd);
  }, [canvasRef]);

  const controller = {
    beginPath: (msg) => {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(msg.x, msg.y);
    }, lineTo: (msg) => {
      ctxRef.current.lineTo(msg.x, msg.y);
      ctxRef.current.stroke();
    }, close: (msg, { connList, peerList, setConnList, setPeerList }) => {
      connList.some(conn => conn.peer === msg.peer && conn.close());
      setPeerList(peerList.filter(p => p !== msg.peer));
      setConnList(connList.filter(c => c.peer !== msg.peer));
    }, open: (msg, { connList, peerList, setConnList, setPeerList }) => {
      const conn = peer.connect(msg.peer);
      conn.on("open", () => { conn.send(JSON.stringify({ method: "reflexOpen", peer: myPeerId })); });
      setPeerList([...peerList, msg.peer]);
      setConnList([...connList, conn]);
    }
  }

  return (
    <div>
      <h1>CanvasPainting - {myPeerId}</h1>
      <ConnectPeerList
        data={mouseData}
        controller={controller}     
      />
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
    </div>
  );
}

export default CanvasPainting;