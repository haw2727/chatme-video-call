import User from '../models/User.js';
import FriendRequest from '../models/friendRequest.js';
import { broadcastToUser } from './callController.js';

export async function getRecommendedFriends(req, res) {
  try {
    const currentUserId = req.user._id;
    const currentUser = req.user;

    // Get all pending friend requests to exclude users we've already sent requests to
    const pendingRequests = await FriendRequest.find({
      $or: [
        { from: currentUserId, status: 'pending' },
        { to: currentUserId, status: 'pending' }
      ]
    });

    // Extract user IDs from pending requests
    const pendingUserIds = pendingRequests.map(req =>
      req.from.toString() === currentUserId.toString() ? req.to : req.from
    );

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude current user
        { _id: { $nin: currentUser.friends } }, // Exclude existing friends
        { _id: { $nin: pendingUserIds } } // Exclude users with pending requests
      ]
    }).select('-password').limit(50); // Increased limit to 50 users

    res.status(200).json({ success: true, data: recommendedUsers });
  } catch (error) {
    console.error('Error fetching recommended friends:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function getMyFriends(req, res) {
  try {
    const userId = req.user && (req.user._id ?? req.user.id)
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Populate friends with explicit include list (do NOT mix include + exclude)
    const user = await User.findById(userId).populate({
      path: 'friends',
      select: '_id fullName profilePic bio isOnline lastSeen', // explicit fields
    })

    const friends = Array.isArray(user?.friends) ? user.friends : []

    return res.status(200).json({ success: true, friends })
  } catch (error) {
    console.error('getMyFriends error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user._id;
    const { id: recipientId } = req.params;

    // cannot send to oneself
    if (myId.toString() === recipientId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot send a friend request to yourself." });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found." });
    }

    // check for existing pending request either direction
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: myId, to: recipientId },
        { from: recipientId, to: myId },
      ],
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: "Friend request already exists." });
    }

    // create and await
    const friendRequest = await FriendRequest.create({
      from: myId,
      to: recipientId,
      status: 'pending',
    });

    if (!friendRequest) {
      return res.status(500).json({ success: false, message: "Failed to create friend request." });
    }

    // Populate the friend request with sender info for real-time notification
    const populatedRequest = await FriendRequest.findById(friendRequest._id)
      .populate('from', 'fullName profilePic bio nativeLanguage learningLanguage');

    // Send real-time notification to recipient
    broadcastToUser(recipientId.toString(), {
      type: 'friend_request',
      data: populatedRequest
    });

    res.status(201).json({ success: true, message: "Friend request sent successfully.", data: friendRequest });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params
    const friendRequest = await FriendRequest.findById(requestId)
    if (!friendRequest) {
      return res.status(404).json({ success: false, message: 'Friend request not found.' })
    }

    // ensure current user is the recipient
    if (friendRequest.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this request.' })
    }

    if (friendRequest.status === 'accepted') {
      return res.status(200).json({ success: true, message: 'Already accepted.' })
    }

    friendRequest.status = 'accepted'
    await friendRequest.save()

    // Add each user to the other's friends array (idempotent)
    await User.findByIdAndUpdate(friendRequest.from, { $addToSet: { friends: friendRequest.to } })
    await User.findByIdAndUpdate(friendRequest.to, { $addToSet: { friends: friendRequest.from } })

    // Populate the friend request with user info for real-time notification
    const populatedRequest = await FriendRequest.findById(requestId)
      .populate('from to', 'fullName profilePic bio nativeLanguage learningLanguage');

    // Send real-time notification to sender that their request was accepted
    broadcastToUser(friendRequest.from.toString(), {
      type: 'friend_request_accepted',
      data: populatedRequest
    });

    return res.status(200).json({ success: true, message: 'Friend request accepted.' })
  } catch (error) {
    console.error('acceptFriendRequest error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message })
  }
}

export async function getFriendRequests(req, res) {
  try {
    const userId = req.user && (req.user._id ?? req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Incoming pending requests where current user is the recipient
    const incomingRequests = await FriendRequest.find({
      to: userId,
      status: 'pending',
    }).populate('from', 'fullName profilePic bio nativeLanguage learningLanguage');

    // Recently accepted requests (last 7 days) for notification purposes
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentlyAcceptedRequests = await FriendRequest.find({
      $and: [
        { status: 'accepted' },
        { to: userId }, // Only requests where current user was the recipient
        { updatedAt: { $gte: sevenDaysAgo } }
      ],
    }).populate('from', 'fullName profilePic bio nativeLanguage learningLanguage');

    return res.status(200).json({
      success: true,
      incomingRequests,
      acceptedRequests: recentlyAcceptedRequests
    });
  } catch (error) {
    console.error('getFriendRequests error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function rejectFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ success: false, message: 'Friend request not found.' });
    }

    // Ensure current user is the recipient
    if (friendRequest.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this request.' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Friend request is not pending.' });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    return res.status(200).json({ success: true, message: 'Friend request rejected.' });
  } catch (error) {
    console.error('rejectFriendRequest error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function cancelFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ success: false, message: 'Friend request not found.' });
    }

    // Ensure current user is the sender
    if (friendRequest.from.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request.' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Friend request is not pending.' });
    }

    await FriendRequest.findByIdAndDelete(requestId);
    return res.status(200).json({ success: true, message: 'Friend request cancelled.' });
  } catch (error) {
    console.error('cancelFriendRequest error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function getOutgoingFriendRequests(req, res) {
  try {
    const userId = req.user && (req.user._id ?? req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const outgoingRequests = await FriendRequest.find({
      from: userId,
      status: 'pending',
    }).populate('to', 'fullName profilePic bio');

    return res.status(200).json({ success: true, outgoingRequests });
  } catch (error) {
    console.error('getOutgoingFriendRequests error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}