// 窓口（JavaのAPI）のURL
const API_URL = "http://localhost:8080/api/casts";

// 画面が読み込まれたら自動的にJavaからデータを取ってくる
window.onload = function() {
    fetch(API_URL)
        .then(response => {
            // 🛡️ 防御魔法：通信エラー（500や404など）が起きたらここで検知して落とす
            if (!response.ok) {
                throw new Error(`HTTPエラー! ステータス: ${response.status}`);
            }
            return response.json(); // テキストデータをJSのオブジェクトにパース
        })
        .then(castList => {
            const castContainer = document.getElementById("cast-container");
            
            // 🛡️ 防御魔法：もしHTML側に受け皿（部屋）がなくても安全にスルー
            if (!castContainer) return;
            castContainer.innerHTML = '';

            // Javaから届いたキャストの人数分、ループしてカードを作る
            castList.forEach((cast, index) => {
                // グラフを識別するために、キャストごとに固有のID（例: chart-0, chart-1）を作る
                const canvasId = `chart-${index}`;

                // カードの骨組み（HTML）を組み立てる（中にグラフ用のcanvasタグを仕込む）
                const card = document.createElement("div");
                card.className = "cast-card";
                card.innerHTML = `
                    <h3>${cast.name} (${cast.age}歳)</h3>
                    <p>タイプ: ${cast.type}</p>
                    <div style="width: 250px; height: 250px; margin: 0 auto;">
                        <canvas id="${canvasId}"></canvas>
                    </div>
                `;
                castContainer.appendChild(card);

                // 🛡️ 安全装置：万が一データが空（nullなど）だった場合は0点として扱う
                const acting = cast.acting || 0;
                const action = cast.action || 0;
                const stability = cast.stability || 0;
                const flexibility = cast.flexibility || 0;
                const visual = cast.visual || 0;

                // 📊 Chart.jsを使って、今作った画用紙に五角形（レーダーチャート）を描画する
                const ctx = document.getElementById(canvasId).getContext('2d');
                new Chart(ctx, {
                    type: 'radar', // レーダーチャート（五角形）を指定
                    data: {
                        // 五角形の角（頂点）のラベル名
                        labels: ['演技力', 'アクション', '現場安定度', '柔軟性', 'ビジュアル'],
                        datasets: [{
                            label: 'ステータス',
                            data: [acting, action, stability, flexibility, visual], // Javaから届いた数値
                            backgroundColor: 'rgba(54, 162, 235, 0.2)', // グラフの中塗りの色
                            borderColor: 'rgb(54, 162, 235)',         // グラフの線の色
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            r: {
                                // 🛡️ 防御魔法：目盛りの限界値を「0〜100」に強制ロック！
                                min: 0,
                                max: 100,
                                ticks: {
                                    stepSize: 20 // 20刻みで目盛り線を入れる
                                }
                            }
                        }
                    }
                });
            });
        })
        .catch(error => {
            // 🛡️ 防御魔法：Javaが起動していなかったり通信に失敗した時のエラーハンドリング
            console.error("Javaからのデータ取得に失敗しました:", error);
            const castContainer = document.getElementById("cast-container");
            if (castContainer) {
                castContainer.innerHTML = `<p style="color: red;">Javaサーバーとの通信に失敗しました。起動しているか確認してください。</p>`;
            }
        });
};