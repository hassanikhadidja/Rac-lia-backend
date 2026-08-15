const ReturnRequest = require("../models/returnRequest");
const cloudinary = require("../config/cloudinary");
const { toFrontendReturnRequest } = require("../utils/mappers");
const { upsertCollectedEmailDoc } = require("../utils/upsertCollectedEmail");

const TYPES = new Set(["retour", "echange", "reclamation"]);
const STATUSES = new Set(["pending", "in_progress", "solved", "closed"]);

const uploadOne = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: cloudinary.UPLOAD_FOLDER }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });

async function resolvePicture(req) {
  if (req.file?.buffer) return uploadOne(req.file.buffer);
  const raw = String(req.body.picture || "");
  if (!raw.startsWith("data:")) return raw;
  const base64 = raw.split(",")[1];
  if (!base64) return "";
  return uploadOne(Buffer.from(base64, "base64"));
}

async function findReturnByIdOrKey(idOrKey) {
  if (!idOrKey) return null;
  const key = String(idOrKey);
  const byKey = await ReturnRequest.findOne({ requestKey: key });
  if (byKey) return byKey;
  if (/^[a-f\d]{24}$/i.test(key)) return ReturnRequest.findById(key);
  return null;
}

exports.getReturns = async (req, res) => {
  try {
    const items = await ReturnRequest.find().sort({ createdAt: -1 });
    return res.json(items.map(toFrontendReturnRequest));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.createReturn = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const comment = String(req.body.comment || "").trim();
    const phone = String(req.body.phone || "").trim();
    if (!name || !comment || !phone) {
      return res.status(400).json({ msg: "Name, phone, and comment are required" });
    }

    const requestType = TYPES.has(req.body.requestType) ? req.body.requestType : "reclamation";
    const status = STATUSES.has(req.body.status) ? req.body.status : "pending";
    const email = String(req.body.email || "").trim().toLowerCase();
    const picture = await resolvePicture(req);

    const doc = await ReturnRequest.create({
      requestKey: req.body.requestKey || req.body.id || `ret-${Date.now()}`,
      requestType,
      name,
      phone,
      email,
      wilaya: String(req.body.wilaya || "").trim(),
      wilayaName: String(req.body.wilayaName || "").trim(),
      comment,
      picture: picture || "",
      status,
    });

    if (email) {
      await upsertCollectedEmailDoc({
        email,
        name,
        newsletter: false,
        source: "returns",
      });
    }

    return res.status(201).json({ msg: "Request sent", returnRequest: toFrontendReturnRequest(doc) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.updateReturn = async (req, res) => {
  try {
    const existing = await findReturnByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });

    if (req.body.requestType && TYPES.has(req.body.requestType)) {
      existing.requestType = req.body.requestType;
    }
    if (req.body.status && STATUSES.has(req.body.status)) {
      existing.status = req.body.status;
    }
    if (req.body.name != null) existing.name = String(req.body.name).trim();
    if (req.body.phone != null) existing.phone = String(req.body.phone).trim();
    if (req.body.email != null) existing.email = String(req.body.email).trim().toLowerCase();
    if (req.body.wilaya != null) existing.wilaya = String(req.body.wilaya).trim();
    if (req.body.wilayaName != null) existing.wilayaName = String(req.body.wilayaName).trim();
    if (req.body.comment != null) existing.comment = String(req.body.comment).trim();
    if (req.file?.buffer || String(req.body.picture || "").startsWith("data:")) {
      existing.picture = await resolvePicture(req);
    }

    await existing.save();
    return res.json({ msg: "Updated", returnRequest: toFrontendReturnRequest(existing) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.deleteReturn = async (req, res) => {
  try {
    const existing = await findReturnByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });
    await ReturnRequest.deleteOne({ _id: existing._id });
    return res.json({ msg: "Deleted" });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};
