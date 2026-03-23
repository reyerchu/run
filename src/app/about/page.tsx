import { Check } from "lucide-react";

export const metadata = {
  title: "關於 | Runner Will Guide",
};

export default function AboutPage() {
  return (
    <section className="section-padding">
      <div className="container-narrow max-w-3xl">
        <div className="mb-8">
          <p className="font-mono uppercase tracking-wider text-xs text-gray-600 mb-2">
            ABOUT US
          </p>
          <h1>
            <span className="font-semibold text-gray-950 text-3xl tracking-tight">關於我們.</span>
            <span className="font-medium text-gray-600 text-base ml-2">
              為跑者提供最完整的賽事資訊平台
            </span>
          </h1>
        </div>

        <div className="max-w-none">
          <p className="text-lg text-gray-600 leading-7 text-pretty max-w-[60ch]">
            Runner Will Guide 是一個一站式馬拉松賽事資訊平台，致力於讓每位跑者都能輕鬆找到心目中的賽事。
          </p>

          <div className="mt-12 space-y-10">
            <div>
              <h2>
                <span className="font-semibold text-gray-950 text-xl tracking-tight">我們的目標.</span>
                <span className="font-medium text-gray-600 text-sm ml-2">
                  不錯過任何想參加的賽事
                </span>
              </h2>
              <p className="text-gray-600 leading-7 text-pretty max-w-[60ch] mt-3">
                收集並整理台灣與國際的馬拉松賽事資訊，包含報名時間、比賽時間、賽事詳情，
                讓跑者不再錯過任何一場想參加的賽事。
              </p>
            </div>

            <div>
              <h2>
                <span className="font-semibold text-gray-950 text-xl tracking-tight">功能特色.</span>
                <span className="font-medium text-gray-600 text-sm ml-2">
                  全方位的賽事管理工具
                </span>
              </h2>
              <ul className="space-y-3 text-gray-600 mt-3">
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-7">台灣與國際賽事分類瀏覽</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-7">報名時間與比賽日期完整呈現</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-7">依月份、距離、地區、狀態篩選</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-7">行事曆模式一覽賽事分佈</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-7">報名截止倒數提醒</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-7">跑者照片分享與心得交流</span>
                </li>
              </ul>
            </div>

            <div>
              <h2>
                <span className="font-semibold text-gray-950 text-xl tracking-tight">資料來源.</span>
                <span className="font-medium text-gray-600 text-sm ml-2">
                  即時更新的可靠資訊
                </span>
              </h2>
              <p className="text-gray-600 leading-7 text-pretty max-w-[60ch] mt-3">
                賽事資訊來自中華民國路跑協會、運動筆記、World Athletics 等公開來源，
                系統每日自動更新，確保資訊即時正確。
              </p>
            </div>

            <div>
              <h2>
                <span className="font-semibold text-gray-950 text-xl tracking-tight">關於我們.</span>
                <span className="font-medium text-gray-600 text-sm ml-2">
                  專業團隊持續維護
                </span>
              </h2>
              <p className="text-gray-600 leading-7 text-pretty max-w-[60ch] mt-3">
                Runner Will Guide 由{" "}
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
