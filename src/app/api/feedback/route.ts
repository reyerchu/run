import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = ["bug", "feature", "general", "other"];

// POST: 提交反饋
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "請先登入" }, { status: 401 });
  }

  const body = await request.json();
  const { type, content } = body;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "請選擇反饋類型" }, { status: 400 });
  }
  if (!content || content.trim().length < 5) {
    return NextResponse.json({ error: "內容至少 5 個字" }, { status: 400 });
  }
  if (content.trim().length > 2000) {
    return NextResponse.json({ error: "內容不超過 2000 字" }, { status: 400 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId: session.user.id,
      type,
      content: content.trim(),
      email: session.user.email,
    },
  });

  // 發送通知信
  try {
    await sendNotificationEmail(feedback, session.user.name || "匿名用戶", session.user.email);
  } catch (e) {
    console.error("反饋通知信發送失敗:", e);
    // 不影響提交成功
  }

  return NextResponse.json({ success: true, id: feedback.id });
}

async function sendNotificationEmail(
  feedback: { id: string; type: string; content: string; createdAt: Date },
  userName: string,
  userEmail: string
) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const notifyTo = process.env.FEEDBACK_NOTIFY_EMAIL;

  if (!smtpHost || !notifyTo) {
    console.log("SMTP 未設定，跳過通知信");
    return;
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort) || 587,
    secure: Number(smtpPort) === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const typeLabels: Record<string, string> = {
    bug: "問題回報",
    feature: "功能建議",
    general: "一般意見",
    other: "其他",
  };

  await transporter.sendMail({
    from: `"Runner Will Guide" <${smtpUser}>`,
    to: notifyTo,
    replyTo: userEmail,
    subject: `[意見反饋] ${typeLabels[feedback.type] || feedback.type} - ${userName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Runner Will Guide 意見反饋</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; color: #6b7280; width: 80px;">類型</td><td style="padding: 8px; font-weight: 600;">${typeLabels[feedback.type] || feedback.type}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">用戶</td><td style="padding: 8px;">${userName}</td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">Email</td><td style="padding: 8px;"><a href="mailto:${userEmail}">${userEmail}</a></td></tr>
          <tr><td style="padding: 8px; color: #6b7280;">時間</td><td style="padding: 8px;">${feedback.createdAt.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</td></tr>
        </table>
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${feedback.content}</p>
        </div>
        <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">直接回覆此信件即可回覆用戶（${userEmail}）</p>
      </div>
    `,
  });
}
