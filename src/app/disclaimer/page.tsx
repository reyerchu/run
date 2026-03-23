export const metadata = { title: "免責聲明 | Runner Will Guide" };

export default function DisclaimerPage() {
  return (
    <section className="section-padding">
      <div className="container-narrow max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">免責聲明</h1>
        <p className="text-sm text-gray-400 mb-8">最後更新日期：2026 年 3 月 23 日</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-[15px] leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900 mt-8">1. 服務說明</h2>
          <p>Runner Will Guide（以下簡稱「本平台」）由 will.guide 營運，致力於提供台灣及國際馬拉松賽事資訊查詢、跑者紀錄管理與社群交流服務。本平台不保證所提供之服務完全符合所有用戶之個別需求。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">2. 內容免責聲明</h2>
          <p>本網站之所有內容，包括但不限於賽事資訊、日期、報名連結、數據及圖表，均僅供一般資訊參考之用，不構成任何形式之：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>對賽事舉辦之保證或承諾</li>
            <li>健康、醫療或運動訓練建議</li>
            <li>對特定賽事品質之推薦或保證</li>
          </ul>
          <p>本平台不保證本網站內容之準確性、完整性或時效性，亦不對因使用或無法使用本網站內容所造成之任何損失負責。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">3. 賽事資訊來源聲明</h2>
          <p>本平台之賽事資訊來自多個公開來源，包括但不限於：運動筆記、bao-ming.com、World Athletics 及各賽事官方網站。資訊可能因時間差、來源更新延遲或自動化爬取之技術限制而與實際情況有所出入。</p>
          <p><strong>使用者在報名或參加任何賽事前，應務必至該賽事官方網站確認最新資訊。</strong></p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">4. 運動風險聲明</h2>
          <p>馬拉松及路跑活動本質上具有一定的身體風險。本平台僅提供賽事資訊查詢服務，不對使用者參加賽事所產生之任何身體傷害、健康問題或意外事故負責。建議使用者在參加賽事前諮詢專業醫療人員。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">5. 用戶義務</h2>
          <p>使用本網站，您同意：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>提供真實、準確且完整的個人資訊。</li>
            <li>妥善保管您的帳號憑證，對帳號下之所有活動負責。</li>
            <li>遵守中華民國及您所在地之適用法律法規。</li>
            <li>尊重其他用戶之權益。</li>
            <li>不得利用本網站從事任何違法或有損本平台聲譽之活動。</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">6. 智慧財產權</h2>
          <p>本網站所有內容、設計、標誌及功能均受智慧財產權法律保護，為本平台或其授權人之財產。未經本平台事先書面授權，任何人不得重製、散布、改作或為任何商業目的使用本網站之內容。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">7. 第三方連結與服務</h2>
          <p>本網站可能包含連結至第三方網站或整合第三方服務（如 Google 帳號登入、賽事官方網站等）。此類第三方服務依其各自之服務條款及隱私政策運作，本平台對其內容、政策或實務不承擔任何責任。建議您在使用前詳閱相關第三方之條款。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">8. 責任限制</h2>
          <p>在法律允許的最大範圍內，本平台對因使用或無法使用本網站而直接或間接造成的任何損害，包括但不限於利潤損失、資料損失、商業中斷或其他衍生性損害，概不負責，即使本平台已事先被告知該等損害發生之可能性。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">9. 聲明修訂</h2>
          <p>本平台保留隨時修訂本免責聲明之權利，修訂後之聲明於本頁面發布時立即生效。繼續使用本網站，即視為您接受修訂後之免責聲明。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">10. 聯絡我們</h2>
          <p>若您對本免責聲明有任何疑問，歡迎透過以下方式與我們聯繫：</p>
          <p>Runner Will Guide by will.guide<br />電子郵件：<a href="mailto:contact@will.guide" className="text-emerald-600 hover:text-emerald-500">contact@will.guide</a></p>
        </div>
      </div>
    </section>
  );
}
