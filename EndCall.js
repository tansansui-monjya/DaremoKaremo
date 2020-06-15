//対応するボタンで実行する関数

function end_call(room){

    const endCall = document.getElementById('js-end-call');

    endCall.addEventListener('click',() => {

        room.close();
        
        //window.open(url,'_self').close()で現在のタブを閉じてHPのタブへ移行する
        //タブを単体では閉じることができないので新しいタブを作り昔のタブを閉じる流れ
        //実際はHPのURLを入力する
        window.open('https://www.youtube.com/', '_self').close();

    },
    {once: true});
}