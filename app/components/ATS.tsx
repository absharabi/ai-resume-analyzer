interface ATSTipsProps {
  feedback: Feedback | null;
}

const Tip = ({ tip }: { tip: { type: "good" | "improve"; tip: string } }) => (
  <li className="flex items-start gap-2">
    <span
      className={
        tip.type === "good" ? "text-green-600 font-semibold" : "text-amber-700 font-semibold"
      }
    >
      {tip.type === "good" ? "✓" : "•"}
    </span>
    <span className="text-sm text-gray-800">{tip.tip}</span>
  </li>
);

const ATS = ({ feedback }: ATSTipsProps) => {
  const score = feedback?.ATS?.score ?? 0;
  const tips = feedback?.ATS?.tips ?? [];

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">ATS Score</h3>
        <div className="text-2xl font-bold text-gradient">{score}/100</div>
      </div>
      {tips.length > 0 ? (
        <ul className="list-none flex flex-col gap-2">
          {tips.map((tip, idx) => (
            <Tip key={idx} tip={tip} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No ATS tips available yet.</p>
      )}
    </div>
  );
};

export default ATS;
