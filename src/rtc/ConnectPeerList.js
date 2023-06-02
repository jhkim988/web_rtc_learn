import { useState, useEffect, useContext, useReducer } from 'react';
import { WebRTCContext } from './WebRTCConnectProvider';

// interface
// const key = "2f2b";
// const objConnInfo = {
//   [key]: {
//     conn: {}, // peer connection
//     ctx: {}, // canvas context
//   }, 
// }

const reducer = (state, action) => {
  console.log(state, action);
  switch (action.type) {
    case "open": {
      const conn = action.peer.connect(action.peerId);
      const ctx = action.canvasRef.current.getContext("2d");
      conn.on("open", () => conn.send(JSON.stringify({ type: "openReflection", peerId: action.myPeerId })));
      return {
        ...state,
        [action.peerId]: {
          conn,
          ctx,
        },
      }
    }

    case "openReflection": {
      const conn = action.peer.connect(action.peerId);
      const ctx = action.canvasRef.current.getContext("2d");
      return {
        ...state,
        [action.peerId]: {
          conn,
          ctx,
        },
      }
    }

    case "close": {
      if (action.peerId && state[action.peerId]) {
        const conn = state[action.peerId].conn;
        conn.send(JSON.stringify({ type: "closeReflection", peerId: action.myPeerId }), () => {
          conn.close();
        });
        delete state[action.peerId];  
      }
      return { ...state };
    }

    case "closeReflection": {
      if (action.peerId && state[action.peerId]) {
        const conn = state[action.peerId].conn;
        conn.close();
        delete state[action.peerId];  
      }
      return { ...state };
    }

    case "beginPath": {
      const ctx = state[action.peerId].ctx;
      ctx.beginPath();
      ctx.moveTo(action.x, action.y);
      return state;
    }

    case "lineTo": {
      const ctx = state[action.peerId].ctx;
      ctx.lineTo(action.x, action.y);
      ctx.stroke();
      return state;
    }
    
    case "sendToAll":
      state && Object.values(state).forEach((obj) => obj.conn.send(JSON.stringify({...action.data, peerId: action.myPeerId })));
      return state;

    case "lineEnd":
      return state;

    case "disconnected":
      return state;

    default:
      return state;
  }
}

const ConnectPeerList = ({ data, canvasRef }) => {
  const { peer, peerId: myPeerId } = useContext(WebRTCContext);
  const [inputPeer, setInputPeer] = useState("");

  const [objConnInfo, dispatch] = useReducer(reducer, {});

  const onClickConnect = () => {
    if (!inputPeer) return;
    dispatch({ type: "open", peerId: inputPeer, myPeerId, peer, canvasRef });
    setInputPeer("");
  }

  const onClickDisconnect = e => {
    dispatch({ type: "close", peerId: e.target.dataset.peer, myPeerId });
  }

  // send data
  useEffect(() => {
    dispatch({ type: "sendToAll", data, myPeerId });
  }, [data, myPeerId]);

  // receive data
  useEffect(() => {
    if (!peer) return;
    peer.on("connection", conn => {
      conn.on("data", data => {
        const msg = JSON.parse(data);
        dispatch({ ...msg, peer, conn, canvasRef, myPeerId });
      });
    });
    
    peer.on("disconnected", () => {
      dispatch({ type: "disconnected" });
    });

  }, [canvasRef, myPeerId, peer]);

  return <div>
    <h1>Connect Peer List</h1>
    <input type="text" onChange={e => setInputPeer(e.target.value)} value={inputPeer} />
    <button onClick={onClickConnect}>Connect</button>
    <ul>
      {objConnInfo && Object.keys(objConnInfo).map((peer) => <li key={peer}>{peer} <button data-peer={peer} onClick={onClickDisconnect}>disconnect</button></li>)}
    </ul>
  </div>
}

export default ConnectPeerList;