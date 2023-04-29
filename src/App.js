import WebRTCConnectProvider from './rtc/WebRTCConnectProvider';
import CanvasPainting from './rtc/CanvasPaiting';
import RTCVideo from './rtc/RTCVideo';

const App = () => {
	return <>
		{/* <RTCVideo/> */}
		<WebRTCConnectProvider>
			<CanvasPainting />
		</WebRTCConnectProvider>
	</>
}

export default App;