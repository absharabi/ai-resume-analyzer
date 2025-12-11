import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import { useAuthGuard } from "~/lib/useAuthGuard";
import { logger, safeParseJSON } from "~/lib/utils";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
]);

const Resume = () => {
    const { fs, kv } = usePuterStore();
    const { isCheckingAuth } = useAuthGuard();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [status, setStatus] = useState<ResumeStatus>('processing');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const attemptsRef = useRef(0);
    const delayRef = useRef(2000);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const clearPoll = () => {
            if (pollRef.current) {
                clearTimeout(pollRef.current);
                pollRef.current = null;
            }
        };

        const schedulePoll = () => {
            const delay = delayRef.current;
            clearPoll();
            pollRef.current = setTimeout(loadResume, delay);
        };

        const loadResume = async () => {
            if (!kv || !fs || !id) return;

            const resumeValue = await kv.get(`resume:${id}`);
            if (!resumeValue) {
                attemptsRef.current += 1;
                if (attemptsRef.current > 15) {
                    setErrorMessage("We couldn't find this resume. Please try uploading again.");
                    clearPoll();
                    return;
                }
                schedulePoll();
                return;
            }

            const { data, error } = safeParseJSON<Resume>(resumeValue);
            if (error || !data) {
                setErrorMessage("Saved resume data is corrupted. Please re-upload.");
                setStatus("error");
                clearPoll();
                return;
            }

            setStatus(data.status ?? "processing");
            setErrorMessage(data.errorMessage ?? null);

            try {
                if (data.resumePath) {
                    const resumeBlob = await fs.read(data.resumePath);
                    if (resumeBlob) {
                        const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
                        const url = URL.createObjectURL(pdfBlob);
                        if (isMounted) setResumeUrl(url);
                    }
                }
            } catch (error) {
                logger.error("Error reading resume file:", error);
            }

            try {
                if (data.imagePath) {
                    const imageBlob = await fs.read(data.imagePath);
                    if (imageBlob) {
                        const url = URL.createObjectURL(imageBlob);
                        if (isMounted) setImageUrl(url);
                    }
                }
            } catch (error) {
                logger.error("Error reading image file:", error);
            }

            const hasFeedback =
                data.feedback &&
                typeof data.feedback === "object" &&
                data.feedback.overallScore !== undefined;

            if (data.status === "error") {
                clearPoll();
                return;
            }

            if (hasFeedback) {
                if (isMounted) {
                    setStatus(data.status ?? "success");
                    setFeedback(data.feedback);
                }
                clearPoll();
                return;
            }

            // Still processing - backoff polling
            attemptsRef.current += 1;
            delayRef.current = Math.min(delayRef.current * 1.5, 10000);
            if (attemptsRef.current > 25) {
                setStatus("error");
                setErrorMessage("Analysis is taking longer than expected. Please try again later.");
                clearPoll();
                return;
            }
            schedulePoll();
        };

        loadResume();

        return () => {
            isMounted = false;
            clearPoll();
        };
    }, [fs, id, kv]);

    const manualRefresh = async () => {
        setIsRefreshing(true);
        try {
            const resumeValue = await kv?.get(`resume:${id}`);
            if (!resumeValue) return;
            const { data, error } = safeParseJSON<Resume>(resumeValue);
            if (error || !data) return;
            setStatus(data.status ?? "processing");
            setErrorMessage(data.errorMessage ?? null);
            if (data.feedback && typeof data.feedback === "object") {
                setFeedback(data.feedback);
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <main className="p-8">
                <p className="text-gray-600">Checking your session…</p>
            </main>
        );
    }

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover lg:h-[100vh] lg:sticky lg:top-0 items-center justify-center max-lg:min-h-[400px] max-lg:max-h-[500px] max-sm:min-h-[300px] max-sm:max-h-[400px]">
                    {imageUrl && resumeUrl ? (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 max-sm:mx-2 lg:h-[90%] max-lg:h-full max-wxl:h-fit w-fit max-lg:w-full">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl max-sm:rounded-lg"
                                    title="resume"
                                />
                            </a>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 max-sm:text-sm">
                            Loading preview...
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl max-sm:text-2xl !text-black font-bold">Resume Review</h2>
                    {status === "processing" && (
                        <div className="flex flex-col gap-3 max-sm:gap-2">
                            <p className="text-gray-700 text-sm max-sm:text-xs">
                                Your resume is being analyzed. This can take a few moments.
                            </p>
                            <div className="w-full flex justify-center">
                                <img
                                    src="/images/resume-scan-2.gif"
                                    className="max-w-sm w-full rounded-xl max-sm:rounded-lg shadow-sm"
                                />
                            </div>
                            <div className="flex gap-3 max-sm:flex-col max-sm:gap-2">
                                <button
                                    className="secondary-button !px-4 !py-2 max-sm:!px-3 max-sm:!py-1.5 max-sm:text-sm"
                                    onClick={manualRefresh}
                                    disabled={isRefreshing}
                                >
                                    {isRefreshing ? "Refreshing..." : "Refresh status"}
                                </button>
                                <button
                                    className="secondary-button !px-4 !py-2 max-sm:!px-3 max-sm:!py-1.5 max-sm:text-sm"
                                    onClick={() => navigate(0)}
                                >
                                    Full reload
                                </button>
                            </div>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl max-sm:rounded-lg p-4 max-sm:p-3">
                            <p className="font-semibold max-sm:text-sm">Analysis failed</p>
                            <p className="mt-1 text-sm max-sm:text-xs">
                                {errorMessage || "Something went wrong while analyzing your resume."}
                            </p>
                            <div className="mt-3 max-sm:mt-2 flex gap-3 max-sm:flex-col max-sm:gap-2">
                                <Link to="/upload" className="primary-button !px-4 !py-2 max-sm:!px-3 max-sm:!py-1.5 max-sm:text-sm">
                                    Re-run analysis
                                </Link>
                                <button
                                    className="secondary-button !px-4 !py-2 max-sm:!px-3 max-sm:!py-1.5 max-sm:text-sm"
                                    onClick={() => navigate(0)}
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}
                    {feedback && status === "success" ? (
                        <div className="flex flex-col gap-8 max-sm:gap-6 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS feedback={feedback} />
                            <Details feedback={feedback} />
                        </div>
                    ) : null}
                </section>
            </div>
        </main>
    )
}
export default Resume