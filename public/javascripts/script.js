// Peerモデルを変更
const Peer = window.Peer;
(async function main() {
  // 操作がDOMをここで取得
  // 自分の
  const localVideo = document.getElementById('js-local-stream');
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const roomMode = document.getElementById('js-room-mode');
  //threevrmのcanvas読み込み
  let canvas = null;
  while(canvas == null){
  canvas = document.getElementById("canvas2").captureStream(30);
  document.getElementById("canvas2").style.cssText += "hidden transform: rotateY(180deg);-webkit-transform:rotateY(180deg);-moz-transform:rotateY(180deg);-ms-transform:rotateY(180deg);";
  //document.getElementById("canvas2").style.visibility = "hidden";
  }
  
  const meta = document.getElementById('js-meta');
  const sdkSrc = document.querySelector('script[src*=skyway]');
  const remoteVideos = document.getElementById('js-remote-streams');
  //共有機能の変数
  const shareTrigger = document.getElementById('js-share-trigger');
  //GETパラメータ(部屋名)を取得
  let roomId
  let time
  let type
  let model
  getParam();
  
  metainnerText = `
  `.trim();
  // 同時接続モードがSFUなのかMESHなのかをここで設定
  const getRoomModeByHash = () => (location.hash === '#sfu' ? 'sfu' : 'mesh');
  //接続モードの変更を感知するリスナーを設置
  window.addEventListener(
    'hashchange',
    () => (roomMode.textContent = getRoomModeByHash())
  );
  // 自分の映像と音声をlocalStreamに代入
  const localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
  // localStreamをdiv(localVideo)に挿入
  
  const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
  const audioTrack = audioStream.getAudioTracks()[0]
  canvas.addTrack(audioTrack)
    // const audioTrack = audioStream.getAudioTracks()[0]
    // remoteVideos.srcObject.addTrack(audioTrack)
  localVideo.srcObject = localStream;
  localVideo.muted = true;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);
  // Peerのインスタンス作成
  const peer = (window.peer = new Peer({
    key: window.__SKYWAY_KEY__,
    debug: 3,
  }));

  // 「div(joinTrigger)が押される＆既に接続が始まっていなかったら接続」するリスナーを設置
  joinTrigger.addEventListener('click', () => {
    // Note that you need to ensure the peer has connected to signaling server
    // before using methods of peer instance.
    if (!peer.open) {
      return;
    }
    // 部屋に接続するメソッド（joinRoom）
    const room = peer.joinRoom(roomId, {
      mode: getRoomModeByHash(),
      // stream: localStream,
      stream: canvas, //canvasをstreamに渡すと相手に渡せる
    });

    // Render remote stream for new peer join in the room
    // 重要：streamの内容に変更があった時（stream）videoタグを作って流す
    room.on('stream', async stream => {
      var arrayLength = remoteVideos.length + 1;
      console.log("他ユーザーの数"+arrayLength);
      // newVideoオブジェクト(タグ)の生成
      const newVideo = document.createElement('video');
      console.log("test");
      // Webコンテンツ上で表示／再生するメディアのソースとなるストリーム（MediaStream）を取得／設定するために使用する。
      newVideo.srcObject = stream;
      // skyWayと接続(ONにする)
      newVideo.playsInline = true;
      // mark peerId to find it later at peerLeave event
      // 誰かが退出した時どの人が退出したかわかるように、data-peer-idを付与
      newVideo.setAttribute('data-peer-id', stream.peerId);
      //スマホの大きさに調節
      newVideo.setAttribute('style','transform: scaleX(-1);height: 40vh;');
      //配置を設定
      newVideo.setAttribute('id','user'+arrayLength);
      // 配列に追加する(remoteVideosという配列にnewVideoを追加)
      remoteVideos.append(newVideo);
      // awaitはasync streamの実行を一時停止し、Promiseの解決または拒否を待ちます。
      await newVideo.play().catch(console.error);
//      count+=1;
    });
    
    // 誰かが退出した場合、div（remoteVideos）内にある任意のdata-peer-idがついたvideoタグの内容を空にして削除する
    room.on('peerLeave', peerId => {
      const remoteVideo = remoteVideos.querySelector(
        `[data-peer-id=${peerId}]`
      );
      //remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      remoteVideo.remove();

    });
    // for closing myself(自分の退出)
    room.once('close', () => {
      
      Array.from(remoteVideos.children).forEach(remoteVideo => {
        //remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
    });
   
    // ボタン（leaveTrigger）を押すとroom.close()を発動
    leaveTrigger.addEventListener('click', () => {
      room.close();
      //ここにHPのURLを記載する/今回はデプロイする前でHPのURLが存在しないためgoogleのURLを記載している
      window.location.href = "/"
      console.log("test")
    }, 
    { once: true });
  });

  //追加機能share
  let copy_url = document.URL
  copy_url = copy_url.replace('model=', '')
  console.log(copy_url)
  shareTrigger.addEventListener('click',() => {
    shared_url_copy(copy_url);
    alert("コピーできました");
  });
  
  const toggleCamera = document.getElementById('js-toggle-camera');
  const toggleMicrophone = document.getElementById('js-toggle-microphone');
  const toggleSpeaker = document.getElementById('js-toggle-speaker');
  const chenge = document.getElementById('change');
  const canvas2 = document.getElementById('canvas2');

  // ボタン押した時のカメラ関係の動作
toggleCamera.addEventListener('click', () => {
  const videoTracks = videoStream.getVideoTracks()[0];
  const localTracks = localStream.getVideoTracks()[0];
  localTracks.enabled = !localTracks.enabled;
  videoTracks.enabled = !videoTracks.enabled;
  console.log(videoTracks.enabled)

  toggleCamera.className = `${videoTracks.enabled ? 'camera-btn' : 'camera-btn_OFF'}`;
  canvas2.className = `${videoTracks.enabled  ? '' : 'canvas2_cover'}`;

});

// ボタン押した時のマイク関係の動作
toggleMicrophone.addEventListener('click', () => {
  const audioTracks = audioStream.getAudioTracks()[0];
  audioTracks.enabled = !audioTracks.enabled;
  console.log(audioTracks.enabled)
  toggleMicrophone.className = `${audioTracks.enabled ? 'mic-btn' : 'mic-btn_OFF'}`;
});

//スピーカー押したときの音量の動作
toggleSpeaker.addEventListener('click',() => {
  remoteVideos.muted.enabled != remoteVideos.muted.enabled;
  console.log(remoteVideos.muted.enabled)
  toggleSpeaker.className = `${remoteVideos.muted? 'speaker-btn' : 'speaker-btn_OFF'}`
})

//マスク関係の動作
if(type=="mask"){
  maskhyouzi();
}else if(type=='babiniku'){
  if(typeof model == "string" ){
    syokika = true
    let VRM = ['','../assets/test1.vrm','../assets/test2.vrm','../assets/test3.vrm','../assets/test4.vrm']
    threevrm(VRM[model]);
  }else{
  syokika = true
  let VRMnum = Math.floor( Math.random() * 4 )+1 ;
  let VRM = ['','../assets/test1.vrm','../assets/test2.vrm','../assets/test3.vrm','../assets/test4.vrm']
  console.log(VRMnum);
  threevrm(VRM[VRMnum]);
  }
}
chenge.addEventListener('click', () => {
  if(type=="mask"){
  }else if(type=='babiniku'){
    if (syokika) {
      console.log("メモリ消去")
      scene.remove.apply(scene, scene.children);
    }
    syokika = true
    currentVRM = null;
    let VRMnum = Math.floor( Math.random() * 4 )+1 ;
    let VRM = ['','../assets/test1.vrm','../assets/test2.vrm','../assets/test3.vrm','../assets/test4.vrm']
    console.log(VRMnum);
    threevrm(VRM[VRMnum]);
  }
});

  // エラー時のダイアログ表示
  function error(message, linkText, linkHref) {
    __modal("エラー", message, linkText, linkHref);
  };

  //URLのGETパラメータを取得
  function getParam(){
    let params = (new URL(document.location)).searchParams;
    roomId = params.get('roomid');
    time = params.get('time');
    type = params.get('type');
    model = params.get('model');
  }
  peer.on('error', console.error);
})();

