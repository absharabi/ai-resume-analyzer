import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import ScoreCircle from './ScoreCircle'
import { usePuterStore } from '~/lib/puter'

const ResumeCard = ({resume}: { resume: Resume}) => {
  const { fs } = usePuterStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Check if feedback is valid (not empty string or undefined)
  const hasValidFeedback = resume.feedback && typeof resume.feedback === 'object' && resume.feedback.overallScore !== undefined;
  const overallScore = hasValidFeedback ? resume.feedback.overallScore : 0;

  useEffect(() => {
    // Check if imagePath is a Puter file path (starts with /) or a regular URL
    if (!resume.imagePath) return;
    
    // If it's already a URL (starts with http:// or https:// or /images/), use it directly
    if (resume.imagePath.startsWith('http://') || 
        resume.imagePath.startsWith('https://') || 
        resume.imagePath.startsWith('/images/')) {
      setImageUrl(resume.imagePath);
      return;
    }

    // Otherwise, it's a Puter file path - load it from Puter
    const loadImage = async () => {
      try {
        const blob = await fs.read(resume.imagePath);
        if (blob) {
          // Revoke previous blob URL if it exists
          if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
          }
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          setImageUrl(url);
        }
      } catch (error) {
        console.error('Failed to load image from Puter:', error);
      }
    };

    loadImage();

    // Cleanup blob URL on unmount or when path changes
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [resume.imagePath, fs]);

  return (
    <Link to={`/resume/${resume.id}`} className='resume-card animate-in fade-in duration-1000'>
        <div className='resume-card-header'>
        <div className='flex flex-col gap-4'>
        <h2 className='text-xl font-bold break-words'>{resume.companyName}</h2>
        <h3 className='text-lg text-gray-600'>{resume.jobTitle}</h3>
        </div>
        <div className='flex-shrink-0'>
           <ScoreCircle score={overallScore} />
        </div>
        </div>
        <div className='gradient-border animate-in fade-in duration-1000'>
            <div className='w-full h-full'>
                {imageUrl ? (
                  <img src={imageUrl}
                  alt='resume' className='w-full h-[350px] max-sm:h-[200px] object-cover object-top'/>
                ) : (
                  <div className='w-full h-[350px] max-sm:h-[200px] bg-gray-200 flex items-center justify-center'>
                    <span className='text-gray-400'>Loading...</span>
                  </div>
                )}
            </div>
        </div>
    </Link>
  )
}

export default ResumeCard