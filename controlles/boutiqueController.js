const Boutique = require("../models/boutique");
const { toFrontendBoutique } = require("../utils/mappers");

const STORE_TYPES = [
  "boutique",
  "maroquinerie",
  "atelier",
  "corner",
  "boutique-de-mode",
  "vente-en-ligne",
];

const LEGACY_STORE_TYPES = {
  flagship: "boutique",
  "boutique phare": "boutique",
  online: "vente-en-ligne",
  "boutique en ligne": "vente-en-ligne",
  "vente en ligne": "vente-en-ligne",
  "boutique de mode": "boutique-de-mode",
};

const ONLINE_STORE_TYPE = "vente-en-ligne";

function normalizeStoreType(type) {
  const raw = String(type || "")
    .trim()
    .toLowerCase();
  if (!raw) return "boutique";
  if (LEGACY_STORE_TYPES[raw]) return LEGACY_STORE_TYPES[raw];
  const compact = raw.replace(/\s+/g, "-");
  if (STORE_TYPES.includes(compact)) return compact;
  return "boutique";
}

function parseCoord(value) {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function mapsSearchUrl(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

function locationFromBody(body) {
  const existing = String(body.location || "").trim();
  if (existing) return existing;
  const parts = [];
  if (body.address) parts.push(String(body.address).trim());
  const cityPostal = [body.city, body.postal].filter(Boolean).join(" ");
  if (cityPostal) parts.push(cityPostal);
  return parts.join(" · ");
}

function fieldsFromBody(body = {}) {
  const type =
    Boolean(body.isOnlineStore) || normalizeStoreType(body.type) === ONLINE_STORE_TYPE
      ? ONLINE_STORE_TYPE
      : normalizeStoreType(body.type);
  const isOnlineStore = type === ONLINE_STORE_TYPE;
  const lat = isOnlineStore ? null : parseCoord(body.lat);
  const lng = isOnlineStore ? null : parseCoord(body.lng);
  const mapLink = isOnlineStore
    ? ""
    : String(body.mapLink || "").trim() || mapsSearchUrl(lat, lng);

  return {
    name: String(body.name || "").trim(),
    type,
    location: locationFromBody(body),
    city: String(body.city || "").trim(),
    postal: String(body.postal || "").trim(),
    phone: String(body.phone || "").trim(),
    website: String(body.website || "").trim(),
    hours: String(body.hours || "").trim(),
    note: String(body.note || "").trim(),
    mapLink,
    isOnlineStore,
    lat,
    lng,
    order: body.order != null && body.order !== "" ? Number(body.order) || 0 : undefined,
  };
}

async function findBoutiqueByIdOrKey(idOrKey) {
  if (!idOrKey) return null;
  const key = String(idOrKey);
  const byKey = await Boutique.findOne({ storeKey: key });
  if (byKey) return byKey;
  if (/^[a-f\d]{24}$/i.test(key)) return Boutique.findById(key);
  return null;
}

exports.getBoutiques = async (req, res) => {
  try {
    const stores = await Boutique.find().sort({ order: 1, createdAt: 1 });
    return res.json(stores.map(toFrontendBoutique).filter(Boolean));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.addBoutique = async (req, res) => {
  try {
    const fields = fieldsFromBody(req.body);
    if (!fields.name) return res.status(400).json({ msg: "Name is required" });

    const storeKey = String(req.body.storeKey || req.body.id || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || `store-${Date.now()}`;

    const existing = await Boutique.findOne({ storeKey });
    if (existing) {
      Object.assign(existing, Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)));
      await existing.save();
      return res.json({ msg: "Updated", boutique: toFrontendBoutique(existing) });
    }

    const store = await Boutique.create({
      storeKey,
      ...fields,
      order: fields.order ?? 0,
    });
    return res.status(201).json({ msg: "Boutique created", boutique: toFrontendBoutique(store) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.updateBoutique = async (req, res) => {
  try {
    const existing = await findBoutiqueByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });

    const fields = fieldsFromBody({ ...existing.toObject(), ...req.body });
    if (!fields.name) return res.status(400).json({ msg: "Name is required" });

    Object.assign(
      existing,
      Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined))
    );
    if (req.body.storeKey || req.body.id) {
      const nextKey = String(req.body.storeKey || req.body.id)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (nextKey) existing.storeKey = nextKey;
    }
    await existing.save();
    return res.json({ msg: "Updated", boutique: toFrontendBoutique(existing) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.deleteBoutique = async (req, res) => {
  try {
    const existing = await findBoutiqueByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });
    await Boutique.deleteOne({ _id: existing._id });
    return res.json({ msg: "Deleted" });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};
