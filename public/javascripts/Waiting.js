let roomId = getParam();
document.getElementById("roomid").value = roomId;

//URLのGETパラメータを取得
function getParam(){
    let params = (new URL(document.location)).searchParams;
    let roomId = params.get('roomid');
    return roomId;
}