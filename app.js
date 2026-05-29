const API_URL = "http://localhost:8080/api/casts";

window.onload = function () {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error(`HTTPエラー! ステータス: ${response.status}`);
            return response.json();
        })
        .then(castList => {
            const castContainer = document.getElementById("cast-container");
            if (!castContainer) return;
            castContainer.innerHTML = '';

            castList.forEach((cast, index) => {
                // 1. カード用チャートの描画
                const canvasId = `chart-${index}`;
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

                const ctx = document.getElementById(canvasId).getContext('2d');
                new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: ['演技力', 'アクション', '現場安定度', '柔軟性', 'ビジュアル'],
                        datasets: [{
                            data: [cast.acting, cast.action, cast.stability, cast.flexibility, cast.visual],
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgb(54, 162, 235)',
                            borderWidth: 2
                        }]
                    },
                    options: { responsive: true, scales: { r: { min: 0, max: 100 } } }
                });

                // 2. 最初のキャストをメインチャートに反映
                if (index === 0) {
                    updateMainChart(cast);
                }
            });
        })
        .catch(error => {
            console.error("データ取得失敗:", error);
            const castContainer = document.getElementById("cast-container");
            if (castContainer) castContainer.innerHTML = `<p style="color: red;">サーバー通信失敗</p>`;
        });
};

// メインチャート描画用関数（index.htmlのデザインを継承）
function updateMainChart(cast) {
    const mainCtx = document.getElementById('performanceChart');
    if (!mainCtx) return;

    // 既にグラフが存在する場合は破棄（重複描画防止）
    if (window.mainChartInstance) window.mainChartInstance.destroy();

    window.mainChartInstance = new Chart(mainCtx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['演技力', 'アクション', '現場安定度', '柔軟性', 'ビジュアル'],
            datasets: [{
                data: [cast.acting, cast.action, cast.stability, cast.flexibility, cast.visual],
                backgroundColor: 'rgba(168, 32, 54, 0.45)',
                borderColor: '#af233a',
                borderWidth: 1.5,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#af233a',
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    grid: { color: '#2d2d2d' },
                    angleLines: { color: '#2d2d2d' },
                    pointLabels: { color: '#999', font: { size: 12 } },
                    ticks: { display: false },
                    min: 0,
                    max: 100 // DBの値に合わせて調整してください
                }
            }
        }
    });
}