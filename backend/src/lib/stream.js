import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

console.log('STREAM API KEY (backend):', apiKey ? `${apiKey.slice(0, 6)}...` : 'undefined');
console.log('STREAM API SECRET loaded:', !!apiSecret);

if (!apiKey || !apiSecret) {
  throw new Error("Missing STREAM_API_KEY or STREAM_API_SECRET in backend .env");
}

export const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (user) => {
  try {
    await streamClient.upsertUsers([user]);
    return true;
  } catch (err) {
    console.error('upsertStreamUser error', err);
    throw err;
  }
};

export const generateStreamToken = (userId) => {
  try {
    return streamClient.createToken(userId);
  } catch (err) {
    console.error('generateStreamToken error', err);
    throw err;
  }
};
