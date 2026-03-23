export const metadata = {
  title: "關於 | Marathon Board",
};

export default function AboutPage() {
  return (
    <section className="section-padding">
      <div className="container-narrow max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">關於 Marathon Board</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-600 leading-relaxed">
            Marathon Board 是一個一站式馬拉松賽事資訊平台，致力於讓每位跑者都能輕鬆找到心目中的賽事。
          </p>

          <div className="mt-12 space-y-10">
            <div>
              <h2 className="text-xl font-semibold mb-3">🎯 我們的目標</h2>
              <p className="text-gray-600 leading-relaxed">
                收集並整理台灣與國際的馬拉松賽事資訊，包含報名時間、比賽時間、賽事詳情，
                讓跑者不再錯過任何一場想參加的賽事。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">📋 功能特色</h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  台灣與國際賽事分類瀏覽
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  報名時間與比賽日期完整呈現
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  依月份、距離、地區、狀態篩選
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  行事曆模式一覽賽事分佈
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  報名截止倒數提醒
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  跑者照片分享與心得交流
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">🔗 資料來源</h2>
              <p className="text-gray-600 leading-relaxed">
                賽事資訊來自中華民國路跑協會、運動筆記、World Athletics 等公開來源，
                系統每日自動更新，確保資訊即時正確。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">💡 關於我們</h2>
              <p className="text-gray-600 leading-relaxed">
                Marathon Board 由{" "}
                <a href="https://will.guide" className="text-emerald-600 hover:text-emerald-500" target="_blank" rel="noopener">
                  will.guide
                </a>{" "}
                團隊開發維護，希望為跑步社群提供更好的資訊服務。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
