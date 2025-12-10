import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { resumes as sampleResumes } from "~/constants";
import { useAuthGuard } from "~/lib/useAuthGuard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
    const { isCheckingAuth } = useAuthGuard();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Show curated sample resumes
        const curated = sampleResumes.filter((r) => r.feedback?.overallScore);
        setResumes(curated);
        setIsLoading(false);
    }, []);
   
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
      <div className="text-center py-8">
        <p className="text-gray-600">No resumes yet. Upload your first resume to get started!</p>
      </div>
    )}
    </section>
  </main>;
}
