interface DetailsProps {
  feedback: Feedback | null;
}

type SectionKey = "toneAndStyle" | "content" | "structure" | "skills";

const SECTION_LABELS: Record<SectionKey, string> = {
  toneAndStyle: "Tone & Style",
  content: "Content",
  structure: "Structure",
  skills: "Skills",
};

const Section = ({
  title,
  score,
  tips,
}: {
  title: string;
  score: number;
  tips: { type: "good" | "improve"; tip: string; explanation?: string }[];
}) => {
  const textColor =
    score > 70 ? "text-green-600" : score > 49 ? "text-amber-700" : "text-red-600";

  return (
    <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">{title}</h4>
        <span className={`text-lg font-bold ${textColor}`}>{score}/100</span>
      </div>
      {tips.length > 0 ? (
        <ul className="flex flex-col gap-2 list-none">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex flex-col gap-1">
              <span className="font-medium text-gray-800">
                {tip.type === "good" ? "✅ " : "⚠️ "}
                {tip.tip}
              </span>
              {tip.explanation && (
                <span className="text-sm text-gray-600 leading-relaxed">{tip.explanation}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No tips yet.</p>
      )}
    </div>
  );
};

const Details = ({ feedback }: DetailsProps) => {
  if (!feedback) return null;

  const sections: SectionKey[] = ["toneAndStyle", "content", "structure", "skills"];

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-4">
      <h3 className="text-xl font-semibold">Detailed Feedback</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {sections.map((key) => {
          const section = feedback[key];
          return (
            <Section
              key={key}
              title={SECTION_LABELS[key]}
              score={section?.score ?? 0}
              tips={section?.tips ?? []}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Details;
