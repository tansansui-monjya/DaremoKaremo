(function(){

    function shared_url_copy(url) {

        // コピー内容を代入するための空の<div>を生成
        var div_copy = document.createElement("div");
        // 選択用の<pre>タグを生成
        var pre_tag = document.createElement('pre');
    
        // 親要素のCSSで user-select: none だとコピーできないので書き換える
        pre_tag.style.webkitUserSelect = 'auto';
        pre_tag.style.userSelect = 'auto';
    
        div_copy.appendChild(pre_tag).textContent = url;
    
        // 画面に表示されないように要素を画面外へ
        var style_element = div_copy.style;
        style_element.position = 'fixed';
        style_element.right = '200%';
    
        // body に追加
        document.body.appendChild(div_copy);
        // 要素を選択
        document.getSelection().selectAllChildren(div_copy);
    
        // クリップボードにコピーしてresultに代入する
        var result = document.execCommand("copy");
    
        // alert("コピーできました:"+ result);
    
        // 要素削除
        document.body.removeChild(div_copy);
    
        
    
        return result;
    
        // //コピーする用に新しくテキストエリアを作成する
        // var shared_url_area = document.createElement("textarea");
        // //表示させる必要がないのでhidden
        // shared_url_area.classList.add('hidden');
        // //テキストエリアにURLを代入する
        // shared_url_area.value = url;
        // //対象をテキストエリアに指定する(多分)
        // document.body.appendChild(shared_url_area);
        // // コピー対象のテキストを選択する
        // shared_url_area.select();
    
        // // 選択しているテキストをクリップボードにコピーする
        // document.execCommand("Copy");
    
        // // コピーをお知らせする
        // alert("コピーできました！ : " + shared_url_area.value);
    
    }
    window.jsLib=window.jsLib||{};
    window.jsLib.shared_url_copy= shared_url_copy;

})();