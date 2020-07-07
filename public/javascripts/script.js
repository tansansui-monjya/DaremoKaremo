const Peer = window.Peer;

(async function main() {

  
  // 操作がDOMをここで取得
  // 自分の
  const localVideo = document.getElementById('js-local-stream');
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const roomId = document.getElementById('js-room-id');
  const roomMode = document.getElementById('js-room-mode');

  //threevrmのcanvas読み込み
  let canvas = null;
  while(canvas == null){
  canvas = document.getElementById("canvas2").captureStream();
  console.log("est");
  }

  //今回使用していないのでコメントアウトする
  // const localText = document.getElementById('js-local-text');
  // const sendTrigger = document.getElementById('js-send-trigger');
  // const messages = document.getElementById('js-messages');

  const meta = document.getElementById('js-meta');
  const sdkSrc = document.querySelector('script[src*=skyway]');
  
  const toggleCamera = document.getElementById('js-toggle-camera');
  const toggleMicrophone = document.getElementById('js-toggle-microphone');

  var count = 0;  // カウント
  const remoteVideos = document.getElementById('js-remote-streams'+count);
  //共有機能の変数
  const shareTrigger = document.getElementById('js-share-trigger');

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
      // stream: localStream,
      stream: canvas,　//canvasをstreamに渡すと相手に渡せる
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
    
    //今回変数messagesをindex.htmlで使用していないためコメントアウトする
    // room.on('data', ({ data, src }) => {
    //   // Show a message sent to the room and who sent
    //   messages.textContent += `${src}: ${data}\n`;
    // });

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
      //今回sendTriggerおよびmessagesを使用していないためコメントアウトする
      // メッセージ送信ボタンを押せなくする
      // sendTrigger.removeEventListener('click', onClickSend);
      // messages.textContent += '== You left ===\n';
      Array.from(remoteVideos.children).forEach(remoteVideo => {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
    });

    // ボタン（sendTrigger）を押すとonClickSendを発動
    // sendTrigger.addEventListener('click', onClickSend);
    // ボタン（leaveTrigger）を押すとroom.close()を発動
    leaveTrigger.addEventListener('click', () => {
      room.close();
      //ここにHPのURLを記載する/今回はデプロイする前でHPのURLが存在しないためgoogleのURLを記載している
      window.open('https://www.google.com/', '_self').close();
    }, 
    { once: true });

    //今回テキストメッセージを送信しないのでコメントアウトする
    // テキストメッセージを送る処理
    // function onClickSend() {
    //   // Send message to all of the peers in the room via websocket
    //   room.send(localText.value);
    //   messages.textContent += `${peer.id}: ${localText.value}\n`;
    //   localText.value = '';
    // }

    //追加機能share
    var copy_url = document.URL
    shareTrigger.addEventListener('click',function(){
      var shared_url = window.jsLib.shared_url_copy(copy_url);
      alert("コピーできました");
    });
  });


    //ボタン押した時のカメラ関係の動作
  toggleCamera.addEventListener('click', () => {
    const videoTracks = localStream.getVideoTracks()[0];
    videoTracks.enabled = !videoTracks.enabled;
    console.log(videoTracks.enabled);
    toggleCamera.textContent = `カメラ${videoTracks.enabled ? 'ON' : 'OFF'}`;
  });

  //ボタン押した時のマイク関係の動作
  toggleMicrophone.addEventListener('click', () => {
    const audioTracks = localStream.getAudioTracks()[0];
    audioTracks.enabled = !audioTracks.enabled;
    console.log(audioTracks.enabled);
    toggleMicrophone.textContent = `マイク${audioTracks.enabled ? 'ON' : 'OFF'}`;
  });

  peer.on('error', console.error);
})();
