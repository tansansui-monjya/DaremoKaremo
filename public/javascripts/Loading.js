$(function() {
    var h = $(window).height();
    
    $('#wrap').css('display','none');
    $('#loader-bg ,#loader').height(h).css('display','block');
});
    
$(window).on('load',function () { //全ての読み込みが完了したら実行
    setTimeout('stopload()',5000)
    // $('#loader-bg').delay(900).fadeOut(800);
    // $('#loader').delay(600).fadeOut(300);
});
    
//10秒たったら強制的にロード画面を非表示
$(function(){
    setTimeout('stopload()',10000);
});
    
function stopload(){
    $('#loader-bg').delay(900).fadeOut(800);
    $('#loader').delay(600).fadeOut(300);
}