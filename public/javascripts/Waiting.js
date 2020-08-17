//URLのGETパラメータを取得
let params = (new URL(document.location)).searchParams;
let roomId = params.get('roomid');
// let time = params.get('time');
document.getElementById("roomid").value = roomId;
// document.getElementById("time").value = time;