/**
 * Utility functions for chat operations
 */

/**
 * Generate a unique chat ID from two user IDs
 * Uses sorted UIDs to ensure consistency regardless of who initiates the chat
 * @param {string} uid1 - First user ID
 * @param {string} uid2 - Second user ID
 * @returns {string} - Unique chat ID in format "uid1_uid2"
 */
export const generateChatId = (uid1, uid2) => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

/**
 * Check if a user is currently online
 * User is considered online if lastOnline is within the last 5 minutes
 * @param {Object} lastOnline - Firestore Timestamp object
 * @returns {boolean} - True if user is online
 */
export const isUserOnline = (lastOnline) => {
    if (!lastOnline) return false;

    const now = Date.now();
    const lastOnlineTime = lastOnline.toMillis();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

    return (now - lastOnlineTime) < fiveMinutes;
};

/**
 * Format a Firestore timestamp for message display
 * @param {Object} timestamp - Firestore Timestamp object
 * @returns {string} - Formatted time string (e.g., "2:30 PM")
 */
export const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate();
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Format a Firestore timestamp for last seen display
 * @param {Object} timestamp - Firestore Timestamp object
 * @returns {string} - Formatted string (e.g., "2 minutes ago", "Yesterday")
 */
export const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const lastSeenTime = timestamp.toMillis();
    const diffMs = now - lastSeenTime;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return timestamp.toDate().toLocaleDateString();
};

/**
 * Get initials from a name for avatar fallback
 * @param {string} name - User's full name
 * @returns {string} - Initials (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name) => {
    if (!name) return '?';

    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
