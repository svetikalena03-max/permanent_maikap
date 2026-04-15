import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "local-private", "telegram-config.json");

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error("Не найден local-private/telegram-config.json");
  }
  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed.botToken || !parsed.chatId) {
    throw new Error("В local-private/telegram-config.json должны быть botToken и chatId");
  }
  return parsed;
}

const config = loadConfig();
const port = Number(process.env.TG_RELAY_PORT || 8787);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  });
  res.end(JSON.stringify(payload));
}

function normalize(value) {
  return String(value || "").trim();
}

function buildMessage(data) {
  const fullname = normalize(data.fullname);
  const phone = normalize(data.phone);
  const channel = normalize(data.channel) || "max";
  const source = normalize(data.source) || "site";
  return [
    "Новая заявка с сайта",
    "",
    `ФИО: ${fullname}`,
    `Телефон: ${phone}`,
    `Канал: ${channel}`,
    `Источник: ${source}`
  ].join("\n");
}

async function sendToTelegram(messageText) {
  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: config.chatId,
      text: messageText
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Telegram API error ${response.status}: ${text}`);
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "POST" || req.url !== "/lead") {
    sendJson(res, 404, { ok: false, error: "Not found" });
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1024 * 64) {
      req.socket.destroy();
    }
  });

  req.on("end", async () => {
    try {
      const payload = JSON.parse(body || "{}");
      const fullname = normalize(payload.fullname);
      const phone = normalize(payload.phone);

      if (!fullname || !phone) {
        sendJson(res, 400, { ok: false, error: "fullname and phone required" });
        return;
      }

      const text = buildMessage(payload);
      await sendToTelegram(text);
      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: String(error && error.message ? error.message : error) });
    }
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Telegram relay started: http://127.0.0.1:${port}/lead`);
});
