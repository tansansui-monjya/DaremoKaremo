function shared_url_copy(url) {

    // コピー対象をJavaScript上で変数として定義する
    const sharedButton = document.getElementById('sharedButton');
    sharedButton.addEventListener('click', () => {

        //コピーする用に新しくテキストエリアを作成する
        var shared_url_area = document.createElement("textarea");
        //表示させる必要がないのでhidden
        shared_url_area.classList.add('hidden');
        //テキストエリアにURLを代入する
        shared_url_area.value = url;
        //対象をテキストエリアに指定する(多分)
        document.body.appendChild(shared_url_area);
        // コピー対象のテキストを選択する
        shared_url_area.select();

        // 選択しているテキストをクリップボードにコピーする
        document.execCommand("Copy");

        // コピーをお知らせする
        alert("コピーできました！ : " + shared_url_area.value);
    });

}