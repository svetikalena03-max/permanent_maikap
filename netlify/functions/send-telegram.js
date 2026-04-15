export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { fullname, phone } = await req.json();

    // Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Netlify Environment Variables.
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const text =
      `Новая заявка с сайта\n\n` +
      `Имя: ${fullname || "—"}\n` +
      `Телефон: ${phone || "—"}`;

    const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text
      })
    });

    if (!tgResponse.ok) {
      return new Response(JSON.stringify({ error: "Ошибка отправки" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Ошибка отправки" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
