const Peer = window.Peer;

(async function main() {
  const localVideo = document.getElementById('js-local-stream');
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const remoteVideos = document.getElementById('js-remote-streams');
  const roomId = document.getElementById('js-room-id');
  const roomMode = document.getElementById('js-room-mode');
  const localText = document.getElementById('js-local-text');
  const sendTrigger = document.getElementById('js-send-trigger');
  const messages = document.getElementById('js-messages');
  const meta = document.getElementById('js-meta');
  const sdkSrc = document.querySelector('script[src*=skyway]');
  const toggleCamera = document.getElementById('js-toggle-camera');
  const toggleMicrophone = document.getElementById('js-toggle-microphone');
  
//スピーカー
// const devices = await navigator.mediaDevices.enumerateDevices();
// const [{ deviceId }] = devices.filter(device => device.kind === 'audiooutput');
// const $audio = document.createElement('audio');
// await $audio.setSinkId(deviceId);

//読み込んだデバイス情報を格納
// function addDevice(device){
//   if(device.kind === 'audioinput') {
//     var id = device.deviceId;
//     var label = device.label || 'microphone';
//     var option = document.createElement('option');
//     option.setAttribute('value',id);
//     option.innerHTML = label + '(' + id + ')';;
//     micList.appendChild(option);
//   }
//   else if(device.kind === 'audiooutput'){
//     var id = device.deviceId;
//     var label = device.label || 'speaker';

//     var option = document.createElement('option');
//     option.setAttribute('value',id);
//     option.innerHTML = label + '(' + id + ')';
//     speakerList.appendChild(option);
//   }
//   else{
//     console.error('UNKNOWN Device kind:' + device.kind);
//   }
// }

//ページ読み込み完了時に動作する内容
document.addEventListener("DOMContentLoaded",function(){
  //使用デバイスから出入力デバイスを読み取る動作
navigator.mediaDevices.enumerateDevices()
.then(function(devices) {
   // 成功時
 devices.forEach(function(device) {
  // デバイスごとの処理
  console.log(device.kind + ": " + device.label + "id = " + device.deviceId)
  addDevice(device)
.then(function() {
 console.log('setSinkID Success');
})
.catch(function(err) {
 console.error('setSinkId Err:', err);
});
 });
})
.catch(function(err) { // エラー発生時
 console.error('enumerateDevide ERROR:', err);
});
}
);


  const localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
      // video: { facingMode: 'user' }, // 液晶側のカメラ
    })
    .catch(console.error);
 
 //ボタン押した時のカメラ関係の動作
toggleCamera.addEventListener('click', () => {
  const videoTracks = localStream.getVideoTracks()[0];
  videoTracks.enabled = !videoTracks.enabled;
  toggleCamera.textContent = `カメラ${videoTracks.enabled ? 'ON' : 'OFF'}`;
});

//ボタン押した時のマイク関係の動作
toggleMicrophone.addEventListener('click', () => {
  const audioTracks = localStream.getAudioTracks()[0];
  audioTracks.enabled = !audioTracks.enabled;
  toggleMicrophone.textContent = `マイク${audioTracks.enabled ? 'ON' : 'OFF'}`;
});

  meta.innerText = `
    UA: ${navigator.userAgent}
    SDK: ${sdkSrc ? sdkSrc.src : 'unknown'}
  `.trim();

  const getRoomModeByHash = () => (location.hash === '#sfu' ? 'sfu' : 'mesh');

  roomMode.textContent = getRoomModeByHash();
  window.addEventListener(
    'hashchange',
    () => (roomMode.textContent = getRoomModeByHash())
  );

  // Render local stream
  localVideo.muted = true; // 自分の音声を自分のスピーカーから聞こえなくする。相手には届く。
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  localVideo.autoplay = true;
  await localVideo.play().catch(console.error);

  // eslint-disable-next-line require-atomic-updates
  const peer = (window.peer = new Peer({
    key: window.__SKYWAY_KEY__,
    debug: 3,
  }));

  // Register join handler
  joinTrigger.addEventListener('click', () => {
    // Note that you need to ensure the peer has connected to signaling server
    // before using methods of peer instance.
    if (!peer.open) {
      return;
    }

    const room = peer.joinRoom(roomId.value, {
      mode: getRoomModeByHash(),
      stream: localStream,
    });

    room.once('open', () => {
      messages.textContent += '=== You joined ===\n';
    });
    room.on('peerJoin', peerId => {
      messages.textContent += `=== ${peerId} joined ===\n`;
    });

    // Render remote stream for new peer join in the room
    room.on('stream', async stream => {
      const newVideo = document.createElement('video');
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      // mark peerId to find it later at peerLeave event
      newVideo.setAttribute('data-peer-id', stream.peerId);
      remoteVideos.append(newVideo);
      await newVideo.play().catch(console.error);
    });

    room.on('data', ({ data, src }) => {
      // Show a message sent to the room and who sent
      messages.textContent += `${src}: ${data}\n`;
    });

    // for closing room members
    room.on('peerLeave', peerId => {
      const remoteVideo = remoteVideos.querySelector(
        `[data-peer-id=${peerId}]`
      );
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      remoteVideo.remove();

      messages.textContent += `=== ${peerId} left ===\n`;
    });

    // for closing myself
    room.once('close', () => {
      sendTrigger.removeEventListener('click', onClickSend);
      messages.textContent += '== You left ===\n';
      Array.from(remoteVideos.children).forEach(remoteVideo => {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
    });

    sendTrigger.addEventListener('click', onClickSend);
    leaveTrigger.addEventListener('click', () => room.close(), { once: true });

    function onClickSend() {
      // Send message to all of the peers in the room via websocket
      room.send(localText.value);

      messages.textContent += `${peer.id}: ${localText.value}\n`;
      localText.value = '';
    }
  });

  peer.on('error', console.error);
})();
