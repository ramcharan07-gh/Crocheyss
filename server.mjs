import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { Resend } from "resend";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 3000);
const contentTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

function config() {
  const { RESEND_API_KEY: apiKey, RESEND_FROM: from, OWNER_EMAIL: ownerEmail } = process.env;
  if (!apiKey || !from || !ownerEmail) throw new Error("Missing RESEND_API_KEY, RESEND_FROM, or OWNER_EMAIL");
  return { resend: new Resend(apiKey), from, ownerEmail };
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 100_000) throw new Error("Request body is too large");
  }
  return JSON.parse(body);
}

function requiredString(payload, key, maxLength = 500) {
  if (typeof payload[key] !== "string" || !payload[key].trim() || payload[key].length > maxLength) {
    throw new Error(`Invalid ${key}`);
  }
  return payload[key].trim();
}

function customerEmail(payload) {
  const email = requiredString(payload, "email", 160);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid customer email");
  return email;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function emailMarkup(title, fields, message) {
  return `<div style="font-family:Arial,sans-serif;color:#382821"><h2>${escapeHtml(title)}</h2>${message ? `<p>${escapeHtml(message)}</p>` : ""}${fields.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join("")}</div>`;
}

async function sendEmail(resend, message, recipientLabel) {
  const { data, error } = await resend.emails.send(message);
  if (error) throw new Error(`Resend could not send the ${recipientLabel} email: ${error.message || "unknown delivery error"}`);
  if (!data?.id) throw new Error(`Resend did not confirm the ${recipientLabel} email`);
  return data.id;
}

async function sendCustomOrder(payload) {
  const name = requiredString(payload, "name", 120);
  const email = customerEmail(payload);
  const requestType = requiredString(payload, "requestType", 200);
  const notes = requiredString(payload, "notes", 2000);
  const { resend, from, ownerEmail } = config();
  const requestId = `CT-CUSTOM-${randomUUID().slice(0, 8).toUpperCase()}`;
  const details = [["Request ID", requestId], ["Name", name], ["Customer email", email], ["Request", requestType], ["Colors", payload.colors || "Not specified"], ["Quantity", String(payload.quantity || 1)], ["Needed by", payload.neededBy || "Not specified"], ["Notes", notes], ["Reference", payload.reference || "None"]];
  await sendEmail(resend, { from, to: ownerEmail, replyTo: email, subject: `Custom order received · ${requestId}`, html: emailMarkup("New custom order received", details, "A customer has submitted a custom order request. Please review it and reply with a quote.") }, "owner");
  await sendEmail(resend, { from, to: email, subject: `Custom order placed · ${requestId}`, html: emailMarkup("Your custom order request was placed", [["Request ID", requestId], ["Hello", name], ["Request", requestType], ["Next step", "We will review your idea and reply with a quote and timeline shortly."]], "Thank you for choosing crocheyss. We received your idea with care and will be in touch soon.") }, "customer");
  return requestId;
}

async function sendOrder(payload) {
  const name = requiredString(payload, "name", 120);
  const email = customerEmail(payload);
  const address = requiredString(payload, "address", 1000);
  if (!Array.isArray(payload.items) || !payload.items.length) throw new Error("Order has no items");
  const { resend, from, ownerEmail } = config();
  const orderId = `CT-${randomUUID().slice(0, 8).toUpperCase()}`;
  const items = payload.items.map((item) => `${item.name} x ${item.quantity} — ₹${item.price || "price to confirm"}`).join(" | ");
  const details = [["Order ID", orderId], ["Name", name], ["Customer email", email], ["Items", items], ["Delivery address", address], ["Order note", payload.note || "None"]];
  await sendEmail(resend, {
    from,
    to: ownerEmail,
    replyTo: email,
    subject: `Order received · ${orderId}`,
    html: emailMarkup("New order received", details, "A new crocheyss order has been placed. Please review the details and reply to the customer when ready.")
  }, "owner");
  await sendEmail(resend, {
    from,
    to: email,
    subject: `Order placed · ${orderId}`,
    html: emailMarkup("Your order has been placed", [["Order ID", orderId], ["Customer", name], ["Items", items], ["Delivery address", address], ["Next step", "We will confirm availability and delivery details shortly."]], "Thank you so much for supporting crocheyss. Your order has been received with care, and we will be in touch soon with the next update.")
  }, "customer");
  return orderId;
}

function json(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "POST" && request.url === "/api/custom-order") return json(response, 200, { ok: true, requestId: await sendCustomOrder(await readJson(request)) });
    if (request.method === "POST" && request.url === "/api/order") return json(response, 200, { ok: true, orderId: await sendOrder(await readJson(request)) });
    if (request.method !== "GET") return json(response, 405, { error: "Method not allowed" });
    const requested = request.url === "/" ? "index.html" : request.url.slice(1);
    const filePath = normalize(join(root, requested));
    if (!filePath.startsWith(root)) return json(response, 403, { error: "Forbidden" });
    if (request.url === "/favicon.ico") {
      response.writeHead(204);
      return response.end();
    }
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
    response.end(await readFile(filePath));
  } catch (error) {
    console.error(error);
    if (!response.headersSent) json(response, 400, { error: error.message || "Request failed" });
  }
});

server.listen(port, () => console.log(`crocheyss running at http://localhost:${port}`));
