import User from '../models/User.js';
import FriendRequest from '../models/friendRequest.js';
export async function getRecommendedFriends(req, res) {
    try {
        const currentUserId = req.user._id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, // Exclude current user
                { _id: { $nin: currentUser.friends } }, // Exclude existing friends
                { isOnboarded: true } // Only include onboarded users
            ]
        }).select('-password').limit(10); // Limit to 10 recommendations

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
      select: '_id fullName profilePic nativeLanguage learningLanguage bio', // explicit fields
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
    }).populate('from', 'fullName profilePic nativeLanguage learningLanguage');

    // Accepted requests involving the user (either direction)
    const acceptedRequests = await FriendRequest.find({
      $and: [
        { status: 'accepted' },
        { $or: [{ from: userId }, { to: userId }] },
      ],
    }).populate('from to', 'fullName profilePic nativeLanguage learningLanguage');

    return res.status(200).json({ success: true, incomingRequests, acceptedRequests });
  } catch (error) {
    console.error('getFriendRequests error:', error);
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
    }).populate('to', 'fullName profilePic nativeLanguage learningLanguage');

    return res.status(200).json({ success: true, outgoingRequests });
  } catch (error) {
    console.error('getOutgoingFriendRequests error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}