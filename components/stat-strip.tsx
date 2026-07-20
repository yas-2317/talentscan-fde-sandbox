export type StatItem = {
  label: string;
  value: string;
  unit?: string;
  note?: string;
};

export function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <dl className="stat-strip">
      {items.map((item) => (
        <div className="stat-strip-item" key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            {item.value}
            {item.unit && <small>{item.unit}</small>}
          </dd>
          {item.note && <p>{item.note}</p>}
        </div>
      ))}
    </dl>
  );
}
