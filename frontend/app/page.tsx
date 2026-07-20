import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold mb-4">ResumeHive</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md text-center">
        Build ATS-friendly resumes that get you more interviews.
      </p>
      <Link
        href="/resume-builder"
        className="rounded-lg bg-blue-600 px-8 py-3 text-white font-semibold hover:bg-blue-700 transition"
      >
        Build Resume
      </Link>
    </main>
  );
}
