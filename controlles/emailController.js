const CollectedEmail = require("../models/collectedEmail");
const User = require("../models/user");
const { toFrontendCollectedEmail } = require("../utils/mappers");
const {
  isValidEmail,
  parseNewsletter,
  upsertCollectedEmailDoc,
} = require("../utils/upsertCollectedEmail");

async function findEmailByIdOrKey(idOrKey) {
  if (!idOrKey) return null;
  const key = String(idOrKey);
  const byKey = await CollectedEmail.findOne({ emailKey: key });
  if (byKey) return byKey;
  const byEmail = await CollectedEmail.findOne({ email: key.toLowerCase() });
  if (byEmail) return byEmail;
  if (/^[a-f\d]{24}$/i.test(key)) return CollectedEmail.findById(key);
  return null;
}

async function backfillAccountEmails() {
  const users = await User.find().select("name email newsletter");
  for (const user of users) {
    if (!user.email) continue;
    await upsertCollectedEmailDoc({
      email: user.email,
      name: user.name || "",
      newsletter: user.newsletter !== false,
      source: "account",
      forceNewsletter: true,
    });
  }
}

exports.getEmails = async (req, res) => {
  try {
    await backfillAccountEmails();
    const emails = await CollectedEmail.find().sort({ updatedAt: -1 });
    return res.json(emails.map(toFrontendCollectedEmail));
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.upsertEmail = async (req, res) => {
  try {
    const newsletter = parseNewsletter(req.body.newsletter);
    const forceNewsletter =
      req.body.forceNewsletter === true ||
      req.body.forceNewsletter === "true" ||
      req.body.forceNewsletter === "1";
    const doc = await upsertCollectedEmailDoc({
      email: req.body.email,
      name: req.body.name || "",
      newsletter,
      source: req.body.source,
      sources: req.body.sources,
      forceNewsletter,
    });
    if (!doc) return res.status(400).json({ msg: "A valid email is required" });
    return res.status(201).json({ msg: "Saved", email: toFrontendCollectedEmail(doc) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.updateEmail = async (req, res) => {
  try {
    const existing = await findEmailByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });

    if (req.body.name != null) existing.name = String(req.body.name).trim();
    const newsletter = parseNewsletter(req.body.newsletter);
    if (newsletter != null) existing.newsletter = newsletter;
    await existing.save();

    if (newsletter != null) {
      await User.updateOne(
        { email: existing.email },
        { $set: { newsletter } }
      );
    }

    return res.json({ msg: "Updated", email: toFrontendCollectedEmail(existing) });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.deleteEmail = async (req, res) => {
  try {
    const existing = await findEmailByIdOrKey(req.params.id);
    if (!existing) return res.status(404).json({ msg: "Not found" });
    await CollectedEmail.deleteOne({ _id: existing._id });
    return res.json({ msg: "Deleted" });
  } catch (error) {
    return res.status(503).json({ msg: error.message });
  }
};

exports.isValidEmail = isValidEmail;
