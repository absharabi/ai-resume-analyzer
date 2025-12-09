import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from 'lib/puter'
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
    const { auth, kv, puterReady } = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState(true);
       
    useEffect(() => {
        if (!auth.isAuthenticated) navigate('/auth?next=/');
    }, [auth.isAuthenticated]);

    useEffect(() => {
        const loadResumes = async () => {
            if (!puterReady || !kv) return;
            
            try {
                const keys = await kv.list('resume:*');
                if (keys && Array.isArray(keys)) {
                    const resumeData = await Promise.all(
                        keys.map(async (key) => {
                            const value = await kv.get(key);
                            if (value) {
                                const parsed = JSON.parse(value) as Resume;
                                // Only include resumes with valid feedback (not empty string)
                                if (parsed.feedback && typeof parsed.feedback === 'object' && parsed.feedback.overallScore !== undefined) {
                                    return parsed;
                                }
                            }
                            return null;
                        })
                    );
                    const validResumes = resumeData.filter((r): r is Resume => r !== null);
                    setResumes(validResumes);
                }
            } catch (error) {
                console.error('Failed to load resumes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (auth.isAuthenticated && puterReady) {
            loadResumes();
        }
    }, [auth.isAuthenticated, puterReady, kv]);
   
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />


    <section className="main-section">
      <div className="page-heading py-2 max-w-3xl mx-auto text-center">
        <h1>Track Your Applications & Resume Ratings</h1>
        <h2>Review your submissions and get AI-powered feedback.</h2>
      </div>
    
    {isLoading ? (
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
      <div className="text-center py-8">
        <p className="text-gray-600">No resumes yet. Upload your first resume to get started!</p>
      </div>
    )}
    </section>
  </main>;
}
