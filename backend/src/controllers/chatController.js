import User from '../models/User.js'; // added import
import { generateStreamToken, upsertStreamUser } from '../lib/stream.js';

export async function getStreamToken(req, res) {
  try {
    const user = req.user;
    const userId = user._id ? user._id.toString() : String(user.id || user);

    // Ensure current user exists in Stream
    try {
      await upsertStreamUser({
        id: userId,
        name: user.fullName || user.name || 'Unknown',
        image: user.profilePic || user.avatar || '',
      });
    } catch (upsertErr) {
      console.warn('Warning: failed to upsert current Stream user:', upsertErr);
    }

    // If frontend passed a target user id (the friend we will open chat with),
    // upsert that user too so channel creation won't fail.
    const targetId = req.query?.target || req.body?.target;
    if (targetId) {
      try {
        const other = await User.findById(targetId).select('-password');
        if (other) {
          await upsertStreamUser({
            id: other._id.toString(),
            name: other.fullName || other.name || 'Unknown',
            image: other.profilePic || other.avatar || '',
          });
        } else {
          console.warn(`Target user ${targetId} not found in DB; skipping upsert`);
        }
      } catch (err) {
        console.warn('Warning: failed to upsert target Stream user:', err);
      }
    }

    const token = generateStreamToken(userId);
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating stream token:', error);
    return res.status(500).json({ message: 'Could not generate stream token' });
  }
}