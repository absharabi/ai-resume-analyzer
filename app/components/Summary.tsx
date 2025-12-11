import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "./ScoreBadge";
// import ScoreBadge from "~/components/ScoreBadge"; // <-- Temporarily commented out due to missing module

const Category = ({ title, score }: { title: string, score: number }) => {
    const textColor = score > 70 ? 'text-green-600'
        : score > 49
        ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row max-sm:flex-col max-sm:items-start gap-2 items-center justify-center max-sm:justify-start w-full">
                    <p className="text-2xl max-sm:text-lg font-semibold">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-2xl max-sm:text-xl font-bold">
                    <span className={textColor}>{score}</span>/100
                </p>
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md w-full max-sm:rounded-xl">
            <div className="flex flex-row max-sm:flex-col items-center p-4 max-sm:p-3 gap-8 max-sm:gap-4">
                <ScoreGauge score={feedback.overallScore} />

                <div className="flex flex-col gap-2 max-sm:items-center max-sm:text-center">
                    <h2 className="text-2xl max-sm:text-xl font-bold">Your Resume Score</h2>
                    <p className="text-sm max-sm:text-xs text-gray-500">
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2 max-sm:gap-1.5 px-4 max-sm:px-3 pb-4 max-sm:pb-3">
                <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
                <Category title="Content" score={feedback.content.score} />
                <Category title="Structure" score={feedback.structure.score} />
                <Category title="Skills" score={feedback.skills.score} />
            </div>
        </div>
    )
}
export default Summary