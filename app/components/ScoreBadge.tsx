type ScoreBadgeProps = {
  score: number;
};

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  let badgeColor = '';
  let badgeText = '';

  if (score > 70) {
    badgeColor = 'bg-badge-green text-green-600';
    badgeText = 'Strong';
  } else if (score > 49) {
    badgeColor = 'bg-badge-yellow text-yellow-600';
    badgeText = 'Good Start';
  } else {
    badgeColor = 'bg-badge-red text-red-600';
    badgeText = 'Needs Work';
  }

  return (
    <div className={`px-3 py-1 max-sm:px-2 max-sm:py-0.5 rounded-full ${badgeColor}`}>
      <p className="text-sm max-sm:text-xs font-medium">{badgeText}</p>
    </div>
  );
}