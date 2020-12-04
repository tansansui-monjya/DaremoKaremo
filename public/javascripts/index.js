//ハッシュ関数
window.onload = async function(){
  const roomId = document.getElementById("roomid");
  const date1 = new Date();
  const date2 = date1.getFullYear() + "" +
    (date1.getMonth() + 1)  + "" +
    date1.getDate() + "" +
    date1.getHours() + "" +
    date1.getMinutes() + "" +
    date1.getSeconds() + "" +
    date1.getMilliseconds();
  console.log(date2);

  // // Convert string to ArrayBuffer
  const buff = new Uint8Array([].map.call(date2, (c) => c.charCodeAt(0))).buffer;
  // Calculate digest
  const digest = await crypto.subtle.digest('SHA-256', buff);
  // Convert ArrayBuffer to hex string
  // (from: https://stackoverflow.com/a/40031979)
  let hash = [].map.call(new Uint8Array(digest), x => ('00' + x.toString(16)).slice(-2)).join('');
  console.log(hash);
  roomId.value = hash;
  // roomId.value = date2;
}