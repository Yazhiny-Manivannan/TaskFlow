// Draws the five dashboard numbers. It receives them as "stats" and fetches nothing.
function StatsCards({ stats }) {
  const cards = [
    { key: 'total', label: 'Total', value: stats.total, testId: 'stats-total' },
    { key: 'pending', label: 'Pending', value: stats.pending, testId: 'stats-pending' },
    {
      key: 'inProgress',
      label: 'In Progress',
      value: stats.inProgress,
      testId: 'stats-in-progress',
    },
    { key: 'completed', label: 'Completed', value: stats.completed, testId: 'stats-completed' },
    {
      key: 'overdue',
      label: 'Overdue',
      value: stats.overdue,
      testId: 'stats-overdue',
      extraClass: ' stat-overdue',
    },
  ];

  return (
    <section className="stats-grid" data-testid="stats-section">
      {cards.map((card) => (
        <div className={'stat-card' + (card.extraClass || '')} key={card.key}>
          <span className="stat-label">{card.label}</span>
          <span className="stat-value" data-testid={card.testId}>
            {card.value}
          </span>
        </div>
      ))}
    </section>
  );
}

export default StatsCards;