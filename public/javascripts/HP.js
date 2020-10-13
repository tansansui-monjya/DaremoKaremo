const room = document.getElementById("room");
const roomId = document.getElementById("roomid");
const room_data = document.getElementById("room_data");
const room_make = document.getElementById("room_make");

room_make.addEventListener('click',() => {
  (async () => {
    const date1 = new Date();
	const date2 = date1.getFullYear() + "" +
				(date1.getMonth() + 1)  + "" +
				date1.getDate() + "" +
				date1.getHours() + "" +
				date1.getMinutes() + "" +
				date1.getSeconds() + "" +
				date1.getMilliseconds();
        console.log(date2);
    roomId.value = room.value;
    roomId.value += date2
    let hashID = await sha256(roomId.value);
    roomId.value = hashID;
    // console.log("test");
    document.room_data.submit();
  })();  
	return;
})

//ハッシュ関数
async function sha256(str) {
    // Convert string to ArrayBuffer
    const buff = new Uint8Array([].map.call(str, (c) => c.charCodeAt(0))).buffer;
    // Calculate digest
    const digest = await crypto.subtle.digest('SHA-256', buff);
    // Convert ArrayBuffer to hex string
    // (from: https://stackoverflow.com/a/40031979)
    let hash = [].map.call(new Uint8Array(digest), x => ('00' + x.toString(16)).slice(-2)).join('');
    // console.log(hash)
    return hash
  }