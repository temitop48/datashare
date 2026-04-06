import { db } from "@/lib/db";

export async function getProfileByOwnerAddress(ownerAddress: string) {
  return db.userProfile.findUnique({
    where: { ownerAddress },
  });
}

export async function getAllProfiles() {
  return db.userProfile.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getProfilesByOwnerAddresses(ownerAddresses: string[]) {
  const uniqueAddresses = Array.from(new Set(ownerAddresses.filter(Boolean)));

  if (uniqueAddresses.length === 0) {
    return [];
  }

  return db.userProfile.findMany({
    where: {
      ownerAddress: {
        in: uniqueAddresses,
      },
    },
  });
}

export async function isVerifiedCreator(ownerAddress: string) {
  const [profile, datasetCount] = await Promise.all([
    db.userProfile.findUnique({
      where: { ownerAddress },
    }),
    db.dataset.count({
      where: { ownerAddress },
    }),
  ]);

  return !!profile && datasetCount > 0;
}