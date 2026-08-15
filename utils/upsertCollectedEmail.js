const CollectedEmail = require("../models/collectedEmail");

const SOURCES = new Set(["account", "newsletter", "contact", "returns", "admin"]);

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function parseNewsletter(value) {
  if (value == null) return null;
  if (value === true || value === "true" || value === "yes" || value === "1") return true;
  if (value === false || value === "false" || value === "no" || value === "0") return false;
  return null;
}

function parseSources(source, sources) {
  const list = [];
  if (Array.isArray(sources)) list.push(...sources);
  if (source) list.push(source);
  return [...new Set(list.map(String).filter((item) => SOURCES.has(item)))];
}

async function upsertCollectedEmailDoc({
  email,
  name = "",
  newsletter,
  source,
  sources,
  forceNewsletter = false,
} = {}) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return null;

  const extraSources = parseSources(source, sources);
  const optedIn =
    newsletter === true || extraSources.includes("account") || extraSources.includes("newsletter");
  const existing = await CollectedEmail.findOne({ email: normalized });

  if (existing) {
    if (name) existing.name = String(name).trim();
    existing.sources = [...new Set([...(existing.sources || []), ...extraSources])];
    if (forceNewsletter && (newsletter === true || newsletter === false)) {
      existing.newsletter = newsletter;
    } else if (newsletter === true) {
      existing.newsletter = true;
    } else if (existing.newsletter == null) {
      existing.newsletter = Boolean(optedIn);
    }
    await existing.save();
    return existing;
  }

  return CollectedEmail.create({
    emailKey: `em-${normalized}`,
    email: normalized,
    name: String(name || "").trim(),
    newsletter: newsletter == null ? Boolean(optedIn) : Boolean(newsletter),
    sources: extraSources.length ? extraSources : ["admin"],
  });
}

module.exports = {
  normalizeEmail,
  isValidEmail,
  parseNewsletter,
  upsertCollectedEmailDoc,
};
