import { useRef, useState } from "react";

const RTCVideo = () => {
  const [rtcState, setRtcState] = useState("init");
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const pc = useRef();
  console.log(rtcState);
  const start = () => {
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    }).then(stream => {
      localVideoRef.current.srcObject = stream;
      setRtcState("ready");
    });
  }

  const call = () => {
    pc.current = new RTCPeerConnection();
    pc.current.addStream(localVideoRef.current.srcObject);

    pc.current.onicecandidate = e => {
      if (e.candidate) {
        sendMessage(e.candidate);
      }
    }

    pc.current.onaddstream = e => {
      remoteVideoRef.current.srcObject = e.stream;
      setRtcState("connected");
    }

    pc.current.createOffer().then(offer => {
      pc.current.setLocalDescription(offer);
      sendMessage(offer);
    });

    setRtcState("calling");
  }

  const hangUp = () => {
    pc.current.close();
    pc.current = null;
    remoteVideoRef.current.srcObject = null;
    setRtcState("init");
  }

  const sendMessage = message => {
    console.log("sendMessage: ", message);
  }

  return <>
    <video ref={localVideoRef} autoPlay/>
    <video ref={remoteVideoRef} autoPlay/>
    <button onClick={start}>Start</button>
    <button onClick={call}>Call</button>
    <button onClick={hangUp}>Hang Up</button>
  </>
}

export default RTCVideo;
