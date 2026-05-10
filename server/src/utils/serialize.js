/** Public author shape for non-anonymous content */
export function publicUser(u) {
  if (!u) return null;
  return {
    id: u._id?.toString?.() ?? u.id,
    username: u.username,
    bio: u.bio,
    avatarUrl: u.avatarUrl || "",
  };
}

export function displayAuthor(userDoc, isAnonymous, anonymousDisplayName) {
  if (isAnonymous) {
    return {
      isAnonymous: true,
      displayName: anonymousDisplayName || "Anonymous",
      user: null,
    };
  }
  return {
    isAnonymous: false,
    displayName: userDoc?.username ?? "Member",
    user: publicUser(userDoc),
  };
}
