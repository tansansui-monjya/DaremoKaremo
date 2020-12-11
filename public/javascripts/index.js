//ハッシュ関数
window.onload = async function(){
  //hiddenのroomIdを取得して日時をハッシュ化したものを設定する
  const roomId = document.getElementById("roomid");
  //日時取得
  const date1 = new Date();
  const date2 = date1.getFullYear() + "" +
    (date1.getMonth() + 1)  + "" +
    date1.getDate() + "" +
    date1.getHours() + "" +
    date1.getMinutes() + "" +
    date1.getSeconds() + "" +
    date1.getMilliseconds();
  //ハッシュ化-asyncじゃなきゃだめっぽい
  const buff = new Uint8Array([].map.call(date2, (c) => c.charCodeAt(0))).buffer;
  const digest = await crypto.subtle.digest('SHA-256', buff);
  // (from: https://stackoverflow.com/a/40031979)
  let hash = [].map.call(new Uint8Array(digest), x => ('00' + x.toString(16)).slice(-2)).join('');
  //値設定
  roomId.value = hash;
}