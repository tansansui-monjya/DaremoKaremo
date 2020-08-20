const room = document.getElementById("room");
const roomId = document.getElementById("roomid");

const date1 = new Date();
	const date2 = date1.getFullYear() + 
				(date1.getMonth() + 1)  + 
				date1.getDate() + 
				date1.getHours() + 
				date1.getMinutes() + 
				date1.getSeconds() + 
				date1.getMilliseconds() +  
				youbi[date1.getDay()] // 0は日曜日～6は土曜日

const room_make = document.addEventListener('click',() => { 
  roomId += room.value;
  (async () => {
    console.log("test");
    let hashID = await sha256(date2);
    document.getElementById("roomid").value = hashID;
  })();  
	return;
})


// window.onbeforeunload = function(event) {
	
// };

//ハッシュ関数
async function sha256(str) {
    // Convert string to ArrayBuffer
    const buff = new Uint8Array([].map.call(str, (c) => c.charCodeAt(0))).buffer;
    // Calculate digest
    const digest = await crypto.subtle.digest('SHA-256', buff);
    // Convert ArrayBuffer to hex string
    // (from: https://stackoverflow.com/a/40031979)
    let hash = [].map.call(new Uint8Array(digest), x => ('00' + x.toString(16)).slice(-2)).join('');
    console.log(hash)
    return hash
  }