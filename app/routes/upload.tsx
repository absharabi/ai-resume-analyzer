import { type FormEvent, useEffect, useState } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID, now, safeParseJSON } from "~/lib/utils";
import { prepareInstructions, AIResponseFormat } from "~/constants";
import { useAuthGuard } from "~/lib/useAuthGuard";

const Upload = () => {
  const { auth, fs, ai, kv, puterReady } = usePuterStore();
  const navigate = useNavigate();
  const { isCheckingAuth, isAuthed } = useAuthGuard();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Restore saved form values (local-only convenience)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("uploadForm");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as {
        companyName?: string;
        jobTitle?: string;
        jobDescription?: string;
      };
      setCompanyName(parsed.companyName || "");
      setJobTitle(parsed.jobTitle || "");
      setJobDescription(parsed.jobDescription || "");
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = { companyName, jobTitle, jobDescription };
    localStorage.setItem("uploadForm", JSON.stringify(data));
  }, [companyName, jobTitle, jobDescription]);

  const handleFileSelect = (file: File | null) => {
    setErrorMessage(null);
    setFile(file);
  };

  const persistRecord = async (data: Resume) => {
    await kv.set(`resume:${data.id}`, JSON.stringify(data));
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setErrorMessage(null);
    let uuid = "";
    let baseRecord: Resume | null = null;

    try {
      if (!puterReady || !isAuthed) {
        setErrorMessage("Please sign in before uploading.");
        return;
      }

      setStatusText("Uploading the file...");
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) {
        setErrorMessage("Failed to upload file");
        return;
      }

      setStatusText("Converting to image...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file) {
        setErrorMessage(imageFile.error || "Failed to convert PDF to image");
        return;
      }

      setStatusText("Uploading the image...");
      const uploadedImage = await fs.upload([imageFile.file]);
      if (!uploadedImage) {
        setErrorMessage("Failed to upload image");
        return;
      }

      setStatusText("Preparing data...");
      uuid = generateUUID();
      const timestamp = now();
      const data: Resume = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: null,
        status: "processing",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      baseRecord = data;
      await persistRecord(data);

      setStatusText("Analyzing...");
      const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({ jobTitle, jobDescription, AIResponseFormat })
      );

      if (!feedback) {
        setStatusText("Analysis queued. Opening review page...");
        navigate(`/resume/${uuid}`);
        return;
      }

      const feedbackText =
        typeof feedback.message.content === "string"
          ? feedback.message.content
          : feedback.message.content[0].text;

      const { data: parsedFeedback, error } =
        safeParseJSON<Feedback>(feedbackText);

      if (!parsedFeedback || error) {
        const errorMsg = error || "Feedback returned in an unexpected format.";
        setErrorMessage(errorMsg);
        await persistRecord({
          ...data,
          status: "error",
          errorMessage: errorMsg,
          updatedAt: now(),
        });
        return;
      }

      await persistRecord({
        ...data,
        status: "success",
        feedback: parsedFeedback,
        updatedAt: now(),
      });

      setStatusText("Analysis complete, redirecting...");
      navigate(`/resume/${uuid}`);
    } catch (error) {
      console.error("Analyze error", error);
      const msg =
        error instanceof Error ? error.message : "Failed to analyze resume";
      setErrorMessage(msg);
      if (uuid) {
        const record =
          baseRecord ??
          ({
            id: uuid,
            resumePath: "",
            imagePath: "",
            companyName,
            jobTitle,
            jobDescription,
          } as Resume);

        await persistRecord({
          ...record,
          feedback: record.feedback ?? null,
          status: "error",
          errorMessage: msg,
          createdAt: record.createdAt ?? now(),
          updatedAt: now(),
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Please select a PDF to analyze.");
      return;
    }
    if (!isAuthed) {
      setErrorMessage("Please sign in before uploading.");
      return;
    }

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <div className="flex flex-col gap-2 items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Step 1</span>
                  <span className="text-gray-400">Upload</span>
                  <span>→</span>
                  <span className="font-semibold text-gray-800">Step 2</span>
                  <span className="text-gray-400">Analyze</span>
                  <span>→</span>
                  <span className="font-semibold text-gray-800">Step 3</span>
                  <span className="text-gray-400">Review</span>
                </div>
                <h2 className="text-center">{statusText}</h2>
              </div>
              <img
                src="/images/resume-scan.gif"
                className="w-full max-w-md mx-auto rounded-xl shadow-sm"
              />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}

          {errorMessage && (
            <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mt-4">
              {errorMessage}
            </p>
          )}

          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={isProcessing || isCheckingAuth}
              >
                {isCheckingAuth ? "Checking sign-in..." : "Analyze Resume"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};
export default Upload;