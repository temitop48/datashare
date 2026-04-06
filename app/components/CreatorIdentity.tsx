import Link from "next/link";

type CreatorIdentityProps = {
  ownerAddress: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
  compact?: boolean;
};

function shortenAddress(address: string) {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function CreatorIdentity({
  ownerAddress,
  displayName,
  avatarUrl,
  isVerified = false,
  compact = false,
}: CreatorIdentityProps) {
  const name = displayName?.trim() || shortenAddress(ownerAddress);

  return (
    <Link
      href={`/profiles/${ownerAddress}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? "0.55rem" : "0.75rem",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          style={{
            width: compact ? "34px" : "42px",
            height: compact ? "34px" : "42px",
            objectFit: "cover",
            borderRadius: "999px",
            border: "1px solid rgba(0, 247, 255, 0.24)",
            boxShadow: "0 0 14px rgba(0, 247, 255, 0.12)",
          }}
        />
      ) : (
        <div
          style={{
            width: compact ? "34px" : "42px",
            height: compact ? "34px" : "42px",
            borderRadius: "999px",
            border: "1px solid rgba(0, 247, 255, 0.24)",
            background:
              "linear-gradient(135deg, rgba(0,247,255,0.18), rgba(255,79,216,0.18))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "var(--text)",
            boxShadow: "0 0 14px rgba(0, 247, 255, 0.12)",
          }}
        >
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div style={{ display: "grid", gap: "0.12rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
          <span
            style={{
              color: "var(--text)",
              fontWeight: 600,
              fontSize: compact ? "0.95rem" : "1rem",
            }}
          >
            {displayName?.trim() || "Anonymous creator"}
          </span>

          {isVerified && (
            <span
              title="Verified creator"
              style={{
                fontSize: "0.7rem",
                padding: "0.2rem 0.45rem",
                borderRadius: "6px",
                border: "1px solid rgba(0,247,255,0.4)",
                background: "rgba(0,247,255,0.1)",
                color: "#00f7ff",
                fontWeight: 700,
                letterSpacing: "0.03em",
                lineHeight: 1,
              }}
            >
              ✔
            </span>
          )}
        </div>

        <span
          style={{
            color: "var(--muted)",
            fontSize: compact ? "0.8rem" : "0.88rem",
          }}
        >
          {shortenAddress(ownerAddress)}
        </span>
      </div>
    </Link>
  );
}