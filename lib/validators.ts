type DatasetInput = {
  title?: unknown;
  description?: unknown;
  chain?: unknown;
  category?: unknown;
  tags?: unknown;
  version?: unknown;
  data?: unknown;
  isPublic?: unknown;
};

export function validateDatasetInput(body: DatasetInput) {
  if (typeof body.title !== "string" || body.title.trim().length < 3) {
    throw new Error("Title must be at least 3 characters");
  }

  if (
    typeof body.description !== "string" ||
    body.description.trim().length < 5
  ) {
    throw new Error("Description must be at least 5 characters");
  }

  if (typeof body.chain !== "string" || body.chain.trim().length === 0) {
    throw new Error("Chain is required");
  }

  if (typeof body.category !== "string" || body.category.trim().length === 0) {
    throw new Error("Category is required");
  }

  if (typeof body.version !== "string" || body.version.trim().length === 0) {
    throw new Error("Version is required");
  }

  if (!Array.isArray(body.tags)) {
    throw new Error("Tags must be an array");
  }

  const allTagsAreStrings = body.tags.every(
    (tag) => typeof tag === "string" && tag.trim().length > 0
  );

  if (!allTagsAreStrings) {
    throw new Error("Each tag must be a non-empty string");
  }

  if (
    body.data === null ||
    typeof body.data !== "object" ||
    Array.isArray(body.data)
  ) {
    throw new Error("Data must be a valid JSON object");
  }

  if (
    body.isPublic !== undefined &&
    typeof body.isPublic !== "boolean"
  ) {
    throw new Error("isPublic must be a boolean");
  }

  return true;
}

export function validateDatasetContentUpdate(body: {
  data?: unknown;
  version?: unknown;
}) {
  if (
    body.data === null ||
    typeof body.data !== "object" ||
    Array.isArray(body.data)
  ) {
    throw new Error("Data must be a valid JSON object");
  }

  if (
    body.version !== undefined &&
    (typeof body.version !== "string" || body.version.trim().length === 0)
  ) {
    throw new Error("Version must be a non-empty string when provided");
  }

  return true;
}

type UserProfileInput = {
  displayName?: unknown;
  bio?: unknown;
  avatarUrl?: unknown;
  website?: unknown;
  twitterHandle?: unknown;
  discordHandle?: unknown;
  contactEmail?: unknown;
  skills?: unknown;
};

export function validateUserProfileInput(body: UserProfileInput) {
  if (
    typeof body.displayName !== "string" ||
    body.displayName.trim().length < 2
  ) {
    throw new Error("Display name must be at least 2 characters");
  }

  if (body.bio !== undefined && typeof body.bio !== "string") {
    throw new Error("Bio must be a string");
  }

  if (body.avatarUrl !== undefined && typeof body.avatarUrl !== "string") {
    throw new Error("Avatar URL must be a string");
  }

  if (body.website !== undefined && typeof body.website !== "string") {
    throw new Error("Website must be a string");
  }

  if (
    body.twitterHandle !== undefined &&
    typeof body.twitterHandle !== "string"
  ) {
    throw new Error("Twitter handle must be a string");
  }

  if (
    body.discordHandle !== undefined &&
    typeof body.discordHandle !== "string"
  ) {
    throw new Error("Discord handle must be a string");
  }

  if (
    body.contactEmail !== undefined &&
    typeof body.contactEmail !== "string"
  ) {
    throw new Error("Contact email must be a string");
  }

  if (body.skills !== undefined && !Array.isArray(body.skills)) {
    throw new Error("Skills must be an array");
  }

  if (
    Array.isArray(body.skills) &&
    !body.skills.every(
      (skill) => typeof skill === "string" && skill.trim().length > 0
    )
  ) {
    throw new Error("Each skill must be a non-empty string");
  }

  return true;
}