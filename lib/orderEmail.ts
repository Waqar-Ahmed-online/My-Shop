import { rs } from "@/lib/format";

export type EmailItem = {
  name: string;
  image: string;
  color: string;
  size: string;
  qty: number;
  price: number;
};

export type EmailOrder = {
  orderNo: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  note: string;
  items: EmailItem[];
  total: number;
  createdAt: Date;
};

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );

// Small thumbnail from Cloudinary (keeps the email light)
const thumb = (url: string) =>
  url.includes("/upload/") ? url.replace("/upload/", "/upload/w_160,h_160,c_fill,q_auto/") : url;

// 0300... -> 92300...
const waPhone = (p: string) => {
  const d = p.replace(/\D/g, "");
  if (d.startsWith("92")) return d;
  return "92" + (d.startsWith("0") ? d.slice(1) : d);
};

const when = (d: Date) =>
  d.toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });

const variant = (i: EmailItem) =>
  [i.color, i.size && `Size ${i.size}`].filter(Boolean).join(" · ");

function shell(inner: string) {
  return `<div style="background:#f3f3f3;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#111">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e5e5">
    <div style="background:#111;padding:20px 24px;text-align:center">
      <span style="color:#FDBB2D;font-size:18px;font-weight:bold;letter-spacing:2px">ABRAR KHAN ELECTRONICS</span>
    </div>
    <div style="padding:26px 24px">${inner}</div>
    <div style="background:#fafafa;padding:14px 24px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee">
      Abrar Khan Electronics &amp; Parts
    </div>
  </div>
</div>`;
}

function itemsTable(items: EmailItem[], total: number) {
  const rows = items
    .map(
      (i) => `<tr>
  <td style="padding:10px 0;border-bottom:1px solid #eee;width:64px">
    <img src="${esc(thumb(i.image))}" width="56" height="56" alt="" style="display:block;border-radius:6px;object-fit:cover;border:1px solid #eee">
  </td>
  <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px">
    <b>${esc(i.name)}</b><br>
    <span style="font-size:12px;color:#777">${esc(variant(i))}${variant(i) ? " · " : ""}${rs(i.price)} × ${i.qty}</span>
  </td>
  <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px;font-weight:bold;white-space:nowrap">${rs(i.price * i.qty)}</td>
</tr>`
    )
    .join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:8px">${rows}
<tr>
  <td colspan="2" style="padding:14px 12px 0 0;text-align:right;font-size:13px;color:#777;text-transform:uppercase;letter-spacing:1px">Total</td>
  <td style="padding:14px 0 0;text-align:right;font-size:18px;font-weight:bold;color:#8a6417;white-space:nowrap">${rs(total)}</td>
</tr></table>`;
}

const itemsText = (items: EmailItem[]) =>
  items
    .map(
      (i, n) =>
        `${n + 1}. ${i.name}${variant(i) ? ` (${variant(i)})` : ""} x${i.qty} = ${rs(i.price * i.qty)}`
    )
    .join("\n");

/* ---------------- to the customer ---------------- */

export function customerEmail(o: EmailOrder, shopWa: string) {
  const subject = `Order received ${o.orderNo} | Abrar Khan Electronics`;

  const html = shell(`
    <h2 style="margin:0 0 6px;font-size:22px">Thank you, ${esc(o.name)}!</h2>
    <p style="margin:0 0 18px;font-size:14px;color:#555;line-height:1.6">
      Your order has been placed successfully. Our team will contact you shortly to confirm
      availability, delivery and payment.
    </p>

    <div style="background:#fafafa;border:1px solid #eee;border-radius:8px;padding:14px 16px;margin-bottom:18px">
      <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px">Order number</div>
      <div style="font-size:22px;font-weight:bold;margin-top:2px">${esc(o.orderNo)}</div>
      <div style="font-size:12px;color:#888;margin-top:2px">${esc(when(o.createdAt))}</div>
    </div>

    ${itemsTable(o.items, o.total)}

    <h3 style="margin:26px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#555">Delivery details</h3>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#333">
      ${esc(o.name)}<br>${esc(o.phone)}<br>${esc(o.city)}<br>${esc(o.address)}
      ${o.note ? `<br><i style="color:#777">Note: ${esc(o.note)}</i>` : ""}
    </p>

    <p style="margin:24px 0 0;font-size:14px;color:#555;line-height:1.6">
      Any question? Message us on
      <a href="https://wa.me/${esc(shopWa)}" style="color:#8a6417;font-weight:bold">WhatsApp</a>
      and mention your order number.
    </p>
  `);

  const text =
    `Thank you, ${o.name}! Your order has been placed.\n\n` +
    `Order number: ${o.orderNo}\n\n${itemsText(o.items)}\n\nTotal: ${rs(o.total)}\n\n` +
    `Delivery details:\n${o.name}\n${o.phone}\n${o.city}\n${o.address}\n` +
    `${o.note ? `Note: ${o.note}\n` : ""}\n` +
    `We will contact you shortly to confirm delivery and payment.\n` +
    `WhatsApp: https://wa.me/${shopWa}`;

  return { subject, html, text };
}

/* ---------------- to the admin ---------------- */

export function adminEmail(
  o: EmailOrder,
  stats: { total: number; fresh: number },
  adminUrl: string
) {
  const pieces = o.items.reduce((n, i) => n + i.qty, 0);
  const subject = `New order ${o.orderNo} | ${rs(o.total)} | ${o.name}`;
  const wa = `https://wa.me/${waPhone(o.phone)}?text=${encodeURIComponent(
    `Assalam o Alaikum ${o.name}! This is Abrar Khan Electronics. We have received your order ${o.orderNo} (${rs(o.total)}).`
  )}`;

  const html = shell(`
    <h2 style="margin:0 0 4px;font-size:22px">New order received</h2>
    <p style="margin:0 0 18px;font-size:13px;color:#888">${esc(when(o.createdAt))}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px"><tr>
      <td style="background:#fff7e0;border:1px solid #f1dc9a;border-radius:8px;padding:12px 14px;width:33%">
        <div style="font-size:11px;color:#8a6417;text-transform:uppercase;letter-spacing:1px">Order</div>
        <div style="font-size:16px;font-weight:bold">${esc(o.orderNo)}</div>
      </td>
      <td style="width:8px"></td>
      <td style="background:#fff7e0;border:1px solid #f1dc9a;border-radius:8px;padding:12px 14px;width:33%">
        <div style="font-size:11px;color:#8a6417;text-transform:uppercase;letter-spacing:1px">Total</div>
        <div style="font-size:16px;font-weight:bold">${rs(o.total)}</div>
      </td>
      <td style="width:8px"></td>
      <td style="background:#fff7e0;border:1px solid #f1dc9a;border-radius:8px;padding:12px 14px;width:33%">
        <div style="font-size:11px;color:#8a6417;text-transform:uppercase;letter-spacing:1px">Pieces</div>
        <div style="font-size:16px;font-weight:bold">${pieces}</div>
      </td>
    </tr></table>

    ${itemsTable(o.items, o.total)}

    <h3 style="margin:26px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#555">Customer</h3>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#333">
      <b>${esc(o.name)}</b><br>
      <a href="tel:${esc(o.phone)}" style="color:#8a6417">${esc(o.phone)}</a><br>
      ${o.email ? `<a href="mailto:${esc(o.email)}" style="color:#8a6417">${esc(o.email)}</a><br>` : ""}
      ${esc(o.city)}<br>${esc(o.address)}
      ${o.note ? `<br><i style="color:#777">Note: ${esc(o.note)}</i>` : ""}
    </p>

    <p style="margin:22px 0 0">
      <a href="${esc(wa)}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:bold;font-size:13px;padding:11px 18px;border-radius:6px">WhatsApp customer</a>
      <a href="${esc(adminUrl)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:bold;font-size:13px;padding:11px 18px;border-radius:6px;margin-left:6px">Open orders</a>
    </p>

    <p style="margin:24px 0 0;padding-top:14px;border-top:1px solid #eee;font-size:13px;color:#666">
      Total orders so far: <b>${stats.total}</b> &nbsp;|&nbsp; New (awaiting confirmation): <b>${stats.fresh}</b>
    </p>
  `);

  const text =
    `NEW ORDER ${o.orderNo} (${rs(o.total)}, ${pieces} pieces)\n${when(o.createdAt)}\n\n` +
    `${itemsText(o.items)}\n\nTotal: ${rs(o.total)}\n\n` +
    `Customer: ${o.name}\nPhone: ${o.phone}\n${o.email ? `Email: ${o.email}\n` : ""}` +
    `City: ${o.city}\nAddress: ${o.address}\n${o.note ? `Note: ${o.note}\n` : ""}\n` +
    `WhatsApp: ${wa}\nOrders: ${adminUrl}\n\n` +
    `Total orders so far: ${stats.total} | New: ${stats.fresh}`;

  return { subject, html, text };
}