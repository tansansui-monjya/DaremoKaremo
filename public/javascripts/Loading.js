$(function() {
    var h = $(window).height();
    
    $('#wrap').css('display','none');
    $('#load_message ,#loading_message ,#BG').height(h).css('display','block');
});
    
$(window).on('load',function () { //全ての読み込みが完了したら実行
    stopload();
});
    
//10秒たったら強制的にロード画面を非表示
$(function(){
    setTimeout('stopload()',10000);
});
    
function stopload(){
    $('#load_message').delay(900).fadeOut(800);
    $('#loading_message').delay(600).fadeOut(300);
    $('#BG').delay(600).fadeOut(300);
}