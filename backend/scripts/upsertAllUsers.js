// run with: node ./src/scripts/upsertAllUsers.js (from backend root)
import mongoose from "mongoose";
import "dotenv/config";
import { connectDB } from "../lib/db.js";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

async function main() {
  await connectDB();
  const users = await User.find({});
  for (const u of users) {
    try {
      await upsertStreamUser({
        id: u._id.toString(),
        name: u.fullName || u.name || "",
        image: u.profilePic || "",
      });
      console.log("Upserted:", u._id.toString());
    } catch (err) {
      console.warn("Failed upserting", u._id.toString(), err);
    }
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});