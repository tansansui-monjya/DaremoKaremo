// function room_join(){
//     // 自分の映像と音声をlocalStreamに代入
//     const localStream = await navigator.mediaDevices
//     .getUserMedia({
//     audio: true,
//     video: true,
//     })
//     .catch(console.error);

//     // Peerのインスタンス作成
//     const peer = (window.peer = new Peer({
//         key: window.__SKYWAY_KEY__,
//         debug: 3,
//     }));

//     if (!peer.open) {
//         return;
//     }

//     // 部屋に接続するメソッド（joinRoom）
//     const room = peer.joinRoom(roomName, {
//         mode: 'mesh',
//         stream: localStream,
//     });


//     //エラーが発生していた場合内容を表示する
//     peer.on('error', error => {
//         console.log(`${error.type}: ${error.message}`);

//     });
// }

// $(function() {
//     $(".overlay-btn-sample").click(function() {
//           $(".overlayall-sample").fadeIn();　/*ふわっと表示*/
//     });
//     $(".overlayall-sample").click(function() {
//           $(".overlayall-sample").fadeOut();　/*ふわっと消える*/
//     });
// });

$(function(){
    $(".overlay-all").show();
    $(".overlay-all").click(function(){
        $(".overlay-all").fadeOut();
    })
})