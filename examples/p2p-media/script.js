const Peer = window.Peer;

(async function main() {
  const localVideo = document.getElementById('js-local-stream');　
  const localId = document.getElementById('js-local-id');
  const callTrigger = document.getElementById('js-call-trigger');
  const closeTrigger = document.getElementById('js-close-trigger');
  const remoteVideo = document.getElementById('js-remote-stream');
  const remoteId = document.getElementById('js-remote-id');
  const meta = document.getElementById('js-meta');
  const sdkSrc = document.querySelector('script[src*=skyway]');
  //追加検証コード
  const copyButton = document.getElementById('copyButton');
  const endCall = document.getElementById('endCall');

  meta.innerText = `
    UA: ${navigator.userAgent}
    SDK: ${sdkSrc ? sdkSrc.src : 'unknown'}
  `.trim();

  const localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .catch(console.error);

  // Render local stream
  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

  const peer = (window.peer = new Peer({
    key: window.__SKYWAY_KEY__,
    debug: 3,
  }));




  //追加検証コード
  copyButton.addEventListener('click', () => {
    var sharedUrlArea = document.createElement("textarea");
    sharedUrlArea.classList.add('hidden');
    
    sharedUrlArea.value = "うらる";

    document.body.appendChild(sharedUrlArea);
    // var copyTarget = "うらる";
    // コピー対象のテキストを選択する
    sharedUrlArea.select();

    //テキストの選択
    // document.getSelection().selectAllChildren(copyTarget);

    // 選択しているテキストをクリップボードにコピーする
    document.execCommand("copy");

    // コピーをお知らせする
    alert("コピーできました！ : " + sharedUrlArea.value);

  });

  endCall.addEventListener('click',() => {
    window.open('https://www.youtube.com/', '_self').close();
  });

  // //対応するボタンで実行する関数
  // function end_call(){
  //   //対応するボタンで実行する関数
  //   // open(location, '_self').close();
  //   window.close();
  // }





  // Register caller handler
  callTrigger.addEventListener('click', () => {
    // Note that you need to ensure the peer has connected to signaling server
    // before using methods of peer instance.
    if (!peer.open) {
      return;
    }

    const mediaConnection = peer.call(remoteId.value, localStream);

    mediaConnection.on('stream', async stream => {
      // Render remote stream for caller
      remoteVideo.srcObject = stream;
      remoteVideo.playsInline = true;
      await remoteVideo.play().catch(console.error);
    });

    mediaConnection.once('close', () => {
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
    });

    closeTrigger.addEventListener('click', () => mediaConnection.close(true));
  });

  peer.once('open', id => (localId.textContent = id));

  // Register callee handler
  peer.on('call', mediaConnection => {
    mediaConnection.answer(localStream);

    mediaConnection.on('stream', async stream => {
      // Render remote stream for callee
      remoteVideo.srcObject = stream;
      remoteVideo.playsInline = true;
      await remoteVideo.play().catch(console.error);
    });

    mediaConnection.once('close', () => {
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
    });

    closeTrigger.addEventListener('click', () => mediaConnection.close(true));
  });

  peer.on('error', console.error);
})();
