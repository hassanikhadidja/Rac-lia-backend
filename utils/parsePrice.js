/** Parse display prices like "€ 5,700" or "5700.00 €" into a number. */
function parsePrice(text) {
  if (typeof text === "number" && !Number.isNaN(text)) return text;
  const cleaned = String(text || "").replace(/[^\d.,]/g, "").replace(",", ".");
  const value = parseFloat(cleaned);
  return Number.isNaN(value) ? 0 : value;
}

function formatPriceEur(amount) {
  const n = Number(amount) || 0;
  return `€ ${n.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

module.exports = { parsePrice, formatPriceEur };
