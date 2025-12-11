interface ATSTipsProps {
  feedback: Feedback | null;
}

const Tip = ({ tip }: { tip: { type: "good" | "improve"; tip: string } }) => (
  <li className="flex items-start gap-2 max-sm:gap-1.5">
    <span
      className={
        tip.type === "good" ? "text-green-600 font-semibold max-sm:text-base" : "text-amber-700 font-semibold max-sm:text-base"
      }
    >
      {tip.type === "good" ? "✓" : "•"}
    </span>
    <span className="text-sm max-sm:text-xs text-gray-800 leading-relaxed">{tip.tip}</span>
  </li>
);

const ATS = ({ feedback }: ATSTipsProps) => {
  const score = feedback?.ATS?.score ?? 0;
  const tips = feedback?.ATS?.tips ?? [];

  return (
    <div className="bg-white rounded-2xl max-sm:rounded-xl shadow-md p-4 max-sm:p-3 flex flex-col gap-3 max-sm:gap-2">
      <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-1">
        <h3 className="text-xl max-sm:text-lg font-semibold">ATS Score</h3>
        <div className="text-2xl max-sm:text-xl font-bold text-gradient">{score}/100</div>
      </div>
      {tips.length > 0 ? (
        <ul className="list-none flex flex-col gap-2 max-sm:gap-1.5">
          {tips.map((tip, idx) => (
            <Tip key={idx} tip={tip} />
          ))}
        </ul>
      ) : (
        <p className="text-sm max-sm:text-xs text-gray-500">No ATS tips available yet.</p>
      )}
    </div>
  );
};

export default ATS;
