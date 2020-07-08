// Peerモデルを変更
const Peer = window.Peer;

(async function main() {
  
  // 操作がDOMをここで取得
  // 自分の
  const localVideo = document.getElementById('js-local-stream');
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  // 相手の
  // const remoteVideos = document.getElementById('js-remote-streams');
  const roomId = document.getElementById('js-room-id');
  const roomMode = document.getElementById('js-room-mode');

  //今回使用していないのでコメントアウトする
  // const localText = document.getElementById('js-local-text');
  // const sendTrigger = document.getElementById('js-send-trigger');
  // const messages = document.getElementById('js-messages');

  const meta = document.getElementById('js-meta');
  const sdkSrc = document.querySelector('script[src*=skyway]');

  var count = 0;  // カウント
  const remoteVideos = document.getElementById('js-remote-streams'+count);
  //共有機能の変数
  const shareTrigger = document.getElementById('js-share-trigger');

  

  metainnerText = `
    
  `.trim();

  // 同時接続モードがSFUなのかMESHなのかをここで設定
  const getRoomModeByHash = () => (location.hash === '#sfu' ? 'sfu' : 'mesh');
  // divタグに接続モードを挿入
  //roomMode.textContent = getRoomModeByHash();
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
    .catch(console.error);

  // localStreamをdiv(localVideo)に挿入
  localVideo.muted = true;
  localVideo.srcObject = localStream;
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
    const room = peer.joinRoom(roomId.value, {
      mode: getRoomModeByHash(),
      stream: localStream,
    });
  

/*
    // 部屋に接続できた時（open）に一度だけdiv(messages)に=== You joined ===を表示
    room.once('open', () => {
      messages.textContent += '=== You joined ===\n';
    });
    // 部屋に誰かが接続してきた時（peerJoin）、いつでもdiv(messages)に下記のテキストを表示
    room.on('peerJoin', peerId => {
      messages.textContent += `=== ${peerId} joined ===\n`;
    });
*/
    // Render remote stream for new peer join in the room
    // 重要：　streamの内容に変更があった時（stream）videoタグを作って流す
    room.on('stream', async stream => {
      // newVideoオブジェクト(タグ)の生成
      const newVideo = document.createElement('video');
      // Webコンテンツ上で表示／再生するメディアのソースとなるストリーム（MediaStream）を取得／設定するために使用する。
      newVideo.srcObject = stream;
      // skyWayと接続(ONにする)
      newVideo.playsInline = true;
      // mark peerId to find it later at peerLeave event
      // 誰かが退出した時どの人が退出したかわかるように、data-peer-idを付与
      newVideo.setAttribute('data-peer-id', stream.peerId);
      // 配列に追加する(remoteVideosという配列にnewVideoを追加)
      remoteVideos.append(newVideo);

//      document.getElementById('rv'+count).innerHTML = remoteVideos;

/*
       (変数名+count)←変数名＝newVideo　にしたい byキム兄
        var nv = v + count
        var nv = document.getElementById('js-remote-streams'+count);
        nv = newVideo;
*/
      // awaitはasync streamの実行を一時停止し、Promiseの解決または拒否を待ちます。
      await newVideo.play().catch(console.error);

      count+=1;

    });

    //今回変数messagesをindex.htmlで使用していないためコメントアウトする
    // room.on('data', ({ data, src }) => {
    //   // Show a message sent to the room and who sent
    //   messages.textContent += `${src}: ${data}\n`;
    // });

    // 誰かが退出した場合、div（remoteVideos）内にある任意のdata-peer-idがついたvideoタグの内容を空にして削除する
    room.on('peerLeave', peerId => {
      const remoteVideo = remoteVideos.querySelector(
        `[data-peer-id=${peerId}]`
      );
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      remoteVideo.remove();
//      messages.textContent += `=== ${peerId} left ===\n`;
    });

    // for closing myself(自分の退出)
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

  const toggleCamera = document.getElementById('js-toggle-camera');
  const toggleMicrophone = document.getElementById('js-toggle-microphone');

  //ボタン押した時のカメラ関係の動作
toggleCamera.addEventListener('click', () => {
  const videoTracks = localStream.getVideoTracks()[0];
  videoTracks.enabled = !videoTracks.enabled;
  console.log(videoTracks.enabled)
  console.log()
  toggleCamera.textContent = `カメラ${videoTracks.enabled ? 'ON' : 'OFF'}`;
});

//ボタン押した時のマイク関係の動作
toggleMicrophone.addEventListener('click', () => {
  const audioTracks = localStream.getAudioTracks()[0];
  audioTracks.enabled = !audioTracks.enabled;
  console.log(audioTracks.enabled)
  toggleMicrophone.textContent = `マイク${audioTracks.enabled ? 'ON' : 'OFF'}`;
});





  peer.on('error', console.error);
})();