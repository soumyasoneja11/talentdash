// RSC — React Server Component. No client-side JavaScript.
export interface ConfidenceDotProps {
  score: number;
}

export const ConfidenceDot = ({
  score,
}: ConfidenceDotProps): React.ReactElement => {
  let colorClass = 'bg-red-500';
  if (score >= 0.8) {
    colorClass = 'bg-green-500';
  } else if (score >= 0.5) {
    colorClass = 'bg-yellow-500';
  }

  const title = `Confidence: ${score.toFixed(2)}`;

  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colorClass}`}
      title={title}
      aria-label={title}
    />
  );
};
