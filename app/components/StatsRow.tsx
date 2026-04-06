type Props = {
  stats: {
    totalDatasets: number;
    publicDatasets: number;
    privateDatasets: number;
    totalDownloads: number;
  };
};

export default function StatsRow({ stats }: Props) {
  const items = [
    { label: "Total datasets", value: stats.totalDatasets },
    { label: "Public", value: stats.publicDatasets },
    { label: "Private", value: stats.privateDatasets },
    { label: "Total downloads", value: stats.totalDownloads },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      {items.map((item) => (
        <div key={item.label} className="ds-stat">
          <p className="ds-stat-label">{item.label}</p>
          <p className="ds-stat-value">{item.value}</p>
        </div>
      ))}
    </div>
  );
}