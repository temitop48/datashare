"use client";

import { useEffect, useState } from "react";

type Props = {
  ownerAddress: string;
};

async function safeReadJson(res: Response) {
  const text = await res.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON response but got: ${text.slice(0, 200)}`);
  }
}

export default function ProfilePageClient({ ownerAddress }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setError(null);

        const res = await fetch("/api/profile");
        const data = await safeReadJson(res);

        if (!res.ok) {
          throw new Error((data as any)?.error || "Failed to load profile");
        }

        if ((data as any).profile) {
          const profile = (data as any).profile;

          setDisplayName(profile.displayName || "");
          setBio(profile.bio || "");
          setAvatarUrl(profile.avatarUrl || "");
          setWebsite(profile.website || "");
          setTwitterHandle(profile.twitterHandle || "");
          setDiscordHandle(profile.discordHandle || "");
          setContactEmail(profile.contactEmail || "");
          setSkills(profile.skills || "");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load profile");
      } finally {
        setLoadingExisting(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl,
          website,
          twitterHandle,
          discordHandle,
          contactEmail,
          skills: skills.split(",").map((s: string) => s.trim()).filter(Boolean),
        }),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        throw new Error((data as any)?.error || "Failed to save profile");
      }

      setMessage("Profile saved successfully.");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ds-panel">
      <h2 className="ds-section-title">Visible Public Details</h2>

      <p className="ds-note" style={{ marginBottom: "1rem" }}>
        Wallet owner: <strong>{ownerAddress}</strong>
      </p>

      {loadingExisting ? (
        <p className="ds-note">Loading existing profile...</p>
      ) : (
        <form className="ds-stack" onSubmit={handleSave}>
          <input
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />

          <textarea
            placeholder="Short bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
          />

          <input
            type="text"
            placeholder="Avatar image URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />

          <input
            type="text"
            placeholder="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <input
            type="text"
            placeholder="X / Twitter handle"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Discord handle"
            value={discordHandle}
            onChange={(e) => setDiscordHandle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Public contact email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Skills separated by commas"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save public profile"}
          </button>
        </form>
      )}

      {message && <p className="ds-success" style={{ marginTop: "1rem" }}>{message}</p>}
      {error && <p className="ds-error" style={{ marginTop: "1rem" }}>{error}</p>}
    </section>
  );
}