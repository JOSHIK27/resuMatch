"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Buffer } from "buffer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ResumeData {
  name: string;
  content: Buffer;
}

export default function Submit() {
  const [topN, setTopN] = useState<number>(1);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { files: resumeFiles } = document.getElementById(
      "resumes"
    ) as HTMLInputElement;

    const jobDescriptionElement = document.getElementById(
      "jobDescription"
    ) as HTMLTextAreaElement;

    const resumeData: ResumeData[] = [];
    if (resumeFiles) {
      await Promise.all(
        Array.from(resumeFiles).map(async (file) => {
          const resumeBytes = await file.arrayBuffer();
          const resumeDataBuffer = Buffer.from(resumeBytes);
          resumeData.push({
            name: file.name,
            content: resumeDataBuffer,
          });
        })
      );
    }

    try {
      const response = await fetch("api/filter", {
        method: "POST",
        body: JSON.stringify({
          resumeData,
          jobDescription: jobDescriptionElement.value,
          topN,
        }),
      });
      if (response.ok) {
        const { shortlisted } = await response.json();
        setResults(shortlisted);
      } else {
        throw new Error("Failed to fetch");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Submit Resumes and Job Description
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="resumes" className="block text-sm font-medium mb-2">
            Upload Resumes (PDF)
          </label>
          <Input
            id="resumes"
            type="file"
            accept=".pdf"
            multiple
            className="w-full"
          />
        </div>
        <div>
          <label
            htmlFor="jobDescription"
            className="block text-sm font-medium mb-2"
          >
            Job Description
          </label>
          <Textarea
            id="jobDescription"
            className="w-full h-32"
            placeholder="Enter the job description here..."
          />
        </div>
        <div>
          <label htmlFor="topN" className="block text-sm font-medium mb-2">
            Filter Top N Resumes
          </label>
          <Input
            id="topN"
            type="number"
            min="1"
            value={topN}
            onChange={(e) => setTopN(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <Button className="w-full py-4" type="submit" disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </Button>
      </form>

      {results.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-full py-4 mt-4"
              disabled={results.length === 0}
            >
              View Top {topN} Resumes
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-4">
                Top {topN} Resumes
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <ul className="space-y-3">
                {results.map((fileName, index) => (
                  <li
                    key={index}
                    className="flex items-center bg-gray-100 rounded-lg p-3"
                  >
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-800 font-medium truncate">
                      {fileName}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => console.log("Download action")} disabled>
                Download All (Coming Soon)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
