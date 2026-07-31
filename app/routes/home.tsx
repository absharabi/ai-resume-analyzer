import type { Route } from "./+types/home";
import { Link } from "react-router";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { useAuthGuard } from "~/lib/useAuthGuard";
import { usePuterStore } from "~/lib/puter";
import { logger, safeParseJSON } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
    const { isCheckingAuth, isAuthed } = useAuthGuard();
    const { kv } = usePuterStore();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Wait for the auth check to settle; the guard redirects if signed out.
        if (isCheckingAuth) return;
        if (!isAuthed) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        const loadResumes = async () => {
            setIsLoading(true);
            try {
                const items = await kv.list("resume:*", true);
                if (cancelled) return;

                const parsed = (items ?? [])
                    .map((item) => (typeof item === "string" ? item : item.value))
                    .map((value) => safeParseJSON<Resume>(value).data)
                    .filter((resume): resume is Resume => Boolean(resume?.id))
                    // Newest first; records written before createdAt existed sort last.
                    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

                setResumes(parsed);
            } catch (error) {
                logger.error("Failed to load resumes from KV:", error);
                if (!cancelled) setResumes([]);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadResumes();

        return () => {
            cancelled = true;
        };
    }, [kv, isCheckingAuth, isAuthed]);
   
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />


    <section className="main-section">
      <div className="page-heading py-2 max-w-3xl mx-auto text-center">
        <h1>Track Your Applications & Resume Ratings</h1>
        <h2>Review your submissions and get AI-powered feedback.</h2>
      </div>
    
    {isLoading || isCheckingAuth ? (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading resumes...</p>
      </div>
    ) : resumes.length > 0 ? (
    <div className="resumes-section">
       {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume} />
    ))}
    </div>
    ) : (
      <div className="text-center py-8 flex flex-col items-center gap-4">
        <p className="text-gray-600">No resumes yet. Upload your first resume to get started!</p>
        <Link to="/upload" className="primary-button w-fit">Upload Resume</Link>
      </div>
    )}
    </section>
  </main>;
}
