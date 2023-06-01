import { useRef, useEffect, useContext, useState } from "react";
import { WebRTCContext } from './WebRTCConnectProvider';
import ConnectPeerList from "./ConnectPeerList";

const CanvasPainting = () => {
  const { peer, peerId: myPeerId } = useContext(WebRTCContext);
  const canvasRef = useRef();
  const ctxRef = useRef();
  const [mouseData, setMouseData] = useState([]);

  // my canvas context
  useEffect(() => {
    const onBeginPath = e => {
      if (!ctxRef.current) return;
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(e.offsetX, e.offsetY);
      canvasRef.current.addEventListener("mousemove", onLineStroke);
      setMouseData({
        type: "beginPath"
        , x: e.offsetX
        , y: e.offsetY
      });
    };
  
    const onLineStroke = e => {
      if (!ctxRef.current) return;
      ctxRef.current.lineTo(e.offsetX, e.offsetY);
      ctxRef.current.stroke();
      setMouseData({
        type: "lineTo"
        , x: e.offsetX
        , y: e.offsetY
      });
    };
  
    const onLineEnd = e => {
      if (!ctxRef.current) return;
      canvasRef.current.removeEventListener("mousemove", onLineStroke);
      setMouseData({
        type: "lineEnd"
      });
    };

    if (ctxRef.current) return;
    ctxRef.current = canvasRef.current.getContext("2d");
    canvasRef.current.addEventListener("mousedown", onBeginPath);
    canvasRef.current.addEventListener("mouseup", onLineEnd);
  }, [canvasRef]);

  return (
    <div>
      <h1>CanvasPainting - {myPeerId}</h1>
      <ConnectPeerList
        data={mouseData}
        canvasRef={canvasRef}
      />
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
    </div>
  );
}

export default CanvasPainting;