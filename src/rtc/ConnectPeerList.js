import { useState, useEffect, useContext, useReducer } from 'react';
import { WebRTCContext } from './WebRTCConnectProvider';

// interface
const key = "2f2b";
const objConnInfo = {
  [key]: {
    conn: {}, // peer connection
    ctx: {}, // canvas context
  }, 
}

const reducer = (state, action) => {
  let ctx = null;

  switch (action.type) {
    case "open":
      return {
        ...state,
        [action.peerId]: {
          conn: action.conn,
          ctx: action.ctx,
        },
      }

    case "openRequest":
      return {
        ...state,
        [action.peerId]: {
          conn: action.conn,
          ctx: action.canvasRef.current.getContext("2d"),
        }
      }

    case "close":
      state[action.peerId] = undefined;
      return state;

    case "beginPath":
      ctx = state[action.peerId].ctx;
      ctx.beginPath();
      ctx.moveTo(action.x, action.y);
      return state;

    case "lineTo":
      ctx = state[action.peerId].ctx;
      ctx.lineTo(action.x, action.y);
      ctx.stroke();
      return state;

    case "disconnected":
      return {};
    
    case "sendToAll":
      Object.values(state).forEach((obj) => obj.conn.send(JSON.stringify({...action.data, peerId: action.myPeerId })));
      return state;
    
    case "lineEnd":
      return state;

    default:
      return;
  }
}

const ConnectPeerList = ({ data, canvasRef }) => {
  const { peer, peerId: myPeerId } = useContext(WebRTCContext);
  const [inputPeer, setInputPeer] = useState("");

  const [objConnInfo, dispatch] = useReducer(reducer, {});

  const onClickConnect = () => {
    if (!inputPeer) return;
    const conn = peer.connect(inputPeer);
    const ctx = canvasRef.current.getContext("2d");
    conn.on("open", () => conn.send(JSON.stringify({ type: "openRequest", peerId: myPeerId })));
    dispatch({ type: "open", peerId: inputPeer, conn, ctx });
    setInputPeer("");
  }

  const onClickDisconnect = e => {
    const peer = e.target.dataset.peer;
    const conn = objConnInfo[peer];
    conn.send(JSON.stringify({ type: "close", peerId: myPeerId }));
    dispatch({ type: "close", peerId: peer });
  }

  // send data
  useEffect(() => {
    dispatch({ type: "sendToAll", data, myPeerId });
  }, [data]);

  // receive data
  useEffect(() => {
    if (!peer) return;
    peer.on("connection", conn => {
      conn.on("data", data => {
        const msg = JSON.parse(data);
        console.log(msg);
        dispatch({ ...msg, conn, canvasRef });
      });
    });
    peer.on("disconnected", () => {
      dispatch({ type: "disconnected" });
    });
  }, [peer]);

  return <div>
    <h1>Connect Peer List</h1>
    <input type="text" onChange={e => setInputPeer(e.target.value)} value={inputPeer} />
    <button onClick={onClickConnect}>Connect</button>
    <ul>
      {Object.keys(objConnInfo).map((peer) => <li key={peer}>{peer} <button data-peer={peer} onClick={onClickDisconnect}>disconnect</button></li>)}
    </ul>
  </div>
}

export default ConnectPeerList;