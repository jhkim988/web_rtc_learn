import { useState, useEffect, useContext } from 'react';
import { WebRTCContext } from './WebRTCConnectProvider';

const ConnectPeerList = ({ data, controller }) => {
  const { peer, peerId: myPeerId } = useContext(WebRTCContext);
  const [inputPeer, setInputPeer] = useState("");
  const [peerList, setPeerList] = useState([]);
  const [connList, setConnList] = useState([]);

  const onClickConnect = () => {
    if (!inputPeer) return;
    const conn = peer.connect(inputPeer);
    conn.on("open", () => conn.send(JSON.stringify({ method: "open", peer: myPeerId })));
    setPeerList([...peerList, inputPeer]);
    setConnList([...connList, conn]);
    setInputPeer("");
  }

  const onClickDisconnect = e => {
    const peer = e.target.dataset.peer;
    const conn = connList.find(c => c.peer === peer);
    conn.send(JSON.stringify({ method: "close", peer: myPeerId }));
    setPeerList(peerList.filter(p => p !== peer));
    setConnList(connList.filter(c => c.peer !== peer));
  }

  useEffect(() => {
    connList.forEach(conn => conn.send(JSON.stringify(data)));
  }, [data]);

  useEffect(() => {
    if (!peer) return;
    peer.on("connection", conn => {
      conn.on("data", data => {
        const msg = JSON.parse(data);
        console.log(msg);
        if (controller[msg.method]) {
          controller[msg.method](msg);
          return;
        }
        switch (msg.method) {
          case "close":
            connList.some(conn => conn.peer === msg.peer && conn.close());
            setPeerList(peerList.filter(p => p !== msg.peer));
            setConnList(connList.filter(c => c.peer !== msg.peer));
            break;
          case "open":
            const conn = peer.connect(msg.peer);
            conn.on("open", () => { conn.send(JSON.stringify({ method: "reflexOpen", peer: myPeerId })); });
            setPeerList([...peerList, msg.peer]);
            setConnList([...connList, conn]);
            break;
          default:
            break;
        }
      });
    });
    peer.on("disconnected", () => {
      setPeerList([]);
      setConnList([]);
    });
  }, [peer]);

  return <div>
    <h1>Connect Peer List</h1>
    <input type="text" onChange={e => setInputPeer(e.target.value)} value={inputPeer} />
    <button onClick={onClickConnect}>Connect</button>
    <ul>
      {peerList.map(peer => <li key={peer}>{peer} <button data-peer={peer} onClick={onClickDisconnect}>disconnect</button></li>)}
    </ul>
  </div>
}

export default ConnectPeerList;