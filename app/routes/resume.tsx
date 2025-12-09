import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";     

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
]);

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        let isMounted = true;
        let poll: ReturnType<typeof setInterval> | null = null;

        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);
            if(!resume) return;

            const data = JSON.parse(resume);

            try {
                const resumeBlob = await fs.read(data.resumePath);
                if(resumeBlob) {
                    const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                    const resumeUrl = URL.createObjectURL(pdfBlob);
                    if (isMounted) setResumeUrl(resumeUrl);
                }
            } catch (error) {
                console.error('Error reading resume file:', error);
            }

            try {
                const imageBlob = await fs.read(data.imagePath);
                if(imageBlob) {
                    const imageUrl = URL.createObjectURL(imageBlob);
                    if (isMounted) setImageUrl(imageUrl);
                }
            } catch (error) {
                console.error('Error reading image file:', error);
            }

            if(data.feedback && typeof data.feedback === 'object' && data.feedback.overallScore !== undefined) {
                if (isMounted) setFeedback(data.feedback);
                if (poll) clearInterval(poll);
            }
            console.log({resumeUrl, imageUrl, feedback: data.feedback });
        }

        loadResume();
        poll = setInterval(loadResume, 2000);

        return () => {
            isMounted = false;
            if (poll) clearInterval(poll);
        };
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <div>
                                <h3 className="font-bold mb-2">ATS Score</h3>
                                <div>
                                    Score: {feedback.ATS?.score || 0}
                                    <ul className="list-disc ml-5 mt-1">
                                        {(feedback.ATS?.tips || []).map((tip: { type: "good" | "improve"; tip: string; }, idx: number) => (
                                            <li key={idx}>
                                                <span className={tip.type === "good" ? "text-green-600" : "text-yellow-700"}>
                                                    {tip.tip}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2">Details</h3>
                                <pre>{JSON.stringify(feedback, null, 2)}</pre>
                            </div>
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume