//URLのGETパラメータを取得
let params = (new URL(document.location)).searchParams;
let roomId = params.get('roomid');
document.getElementById("roomid").value = roomId;