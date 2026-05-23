import { User } from '../models/User.js';

/**
 * Scans a body of text for @username patterns and attempts to resolve them to User IDs.
 * Matches by case-insensitive name, email prefix, or formatted name with spaces.
 * 
 * Example: "@john.doe commented" -> Resolves user "John Doe" or email "john.doe@..."
 */
export const parseMentions = async (text: string): Promise<string[]> => {
  if (!text) return [];

  // Scan for '@' followed by alphanumeric, dots, dashes or underscores
  const matches = text.match(/@([a-zA-Z0-9._-]+)/g);
  if (!matches) return [];

  // Deduplicate matched names
  const usernames = Array.from(new Set(matches.map((m) => m.slice(1).trim())));
  const resolvedUserIds: string[] = [];

  for (const username of usernames) {
    const spacedName = username.replace(/[._-]/g, ' ');
    
    // Resolve case-insensitively using regex on email prefix or name fields
    const user = await User.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${spacedName}$`, 'i') } },
        { name: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: { $regex: new RegExp(`^${username}@`, 'i') } },
      ],
    });

    if (user) {
      resolvedUserIds.push(user._id.toString());
    }
  }

  return Array.from(new Set(resolvedUserIds));
};
