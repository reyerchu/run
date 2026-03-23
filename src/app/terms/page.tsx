export const metadata = { title: "服務條款 | Marathon Board" };

export default function TermsPage() {
  return (
    <section className="section-padding">
      <div className="container-narrow max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">服務條款</h1>
        <p className="text-sm text-gray-400 mb-8">最後更新日期：2026 年 3 月 23 日</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-[15px] leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900 mt-8">1. 接受條款</h2>
          <p>歡迎使用 Marathon Board（以下簡稱「本平台」），由 will.guide 營運。當您存取或使用本網站時，即表示您已閱讀、理解並同意受本服務條款之約束。若您不同意本服務條款的任何部分，請立即停止使用本網站。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">2. 服務說明</h2>
          <p>本平台提供馬拉松賽事資訊查詢、跑者紀錄管理、社群交流等服務，包括台灣及國際賽事的時間、報名資訊與相關連結。本平台保留隨時修改、暫停或終止全部或部分服務之權利，且無需事先通知。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">3. 用戶資格</h2>
          <p>使用本平台之服務，您聲明並保證：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>您提供的所有資訊均真實、正確且完整。</li>
            <li>您具備完全行為能力，或已取得法定代理人之同意。</li>
            <li>您承諾妥善保管帳號及密碼，並對帳號下的所有活動負責。</li>
            <li>如發現帳號遭未經授權使用，應立即通知本平台。</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">4. 可接受使用政策</h2>
          <p>您同意不得進行以下行為：</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>從事任何違法、詐欺或侵害他人權益之活動。</li>
            <li>上傳或傳播含有惡意程式碼、病毒或有害內容的資料。</li>
            <li>干擾、破壞或未經授權存取本網站之系統或相關設施。</li>
            <li>存取或試圖存取他人帳號。</li>
            <li>以自動化工具大量存取或爬取本網站內容。</li>
            <li>冒充本平台工作人員或其他用戶。</li>
            <li>發佈虛假、誤導、誹謗或侵犯他人隱私之內容。</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">5. 智慧財產權</h2>
          <p>本網站上的所有內容，包括但不限於文字、圖片、標誌、圖表、設計及軟體，均屬本平台或其授權人所有，並受中華民國及國際智慧財產權法律保護。未經本平台事先書面許可，任何人不得擅自重製、散布、改作、公開傳輸或為其他商業目的使用。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">6. 用戶提交內容</h2>
          <p>您向本平台提交的跑步紀錄、貼文、照片、評論或其他內容，您保留其所有權，但同時授予本平台為提供服務及相關目的而使用、儲存及處理該等內容的非專屬授權。本平台對提交內容負有保密義務，未經您同意不會對外公開私人資料。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">7. 賽事資訊免責</h2>
          <p>本平台提供之賽事資訊來自公開來源及自動化爬取，可能存在時間差或誤差。使用者應以各賽事官方網站公告為準。本平台不對賽事資訊之準確性、完整性或即時性負責。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">8. 隱私政策</h2>
          <p>本平台對個人資料的收集與處理方式，請詳閱本網站之<a href="/privacy" className="text-emerald-600 hover:text-emerald-500">隱私政策</a>。隱私政策為本服務條款之一部分，具有同等法律效力。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">9. 責任限制</h2>
          <p>在法律允許的最大範圍內，本平台對因使用或無法使用本網站而產生的任何直接、間接、附帶、特殊或衍生性損害（包括但不限於利潤損失、資料損失或業務中斷）不承擔任何責任，即使本平台已被告知此類損害發生的可能性。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">10. 準據法與管轄權</h2>
          <p>本服務條款之解釋與適用，均以中華民國法律為準據法。因本服務條款所生之爭議，雙方同意以臺灣新竹地方法院為第一審管轄法院。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">11. 條款修訂</h2>
          <p>本平台保留隨時修訂本服務條款的權利。修訂後的條款將於本頁面發布時生效。建議您定期查閱本頁面，繼續使用本網站即視為接受修訂後的條款。</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">12. 聯絡我們</h2>
          <p>若您對本服務條款有任何疑問，歡迎透過以下方式與我們聯繫：</p>
          <p>Marathon Board by will.guide<br />電子郵件：<a href="mailto:contact@will.guide" className="text-emerald-600 hover:text-emerald-500">contact@will.guide</a></p>
        </div>
      </div>
    </section>
  );
}
