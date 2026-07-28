import Link from "next/link";

export default function PracticePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Practice</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/practice/companies"
          className="block p-6 border rounded-xl bg-white hover:shadow-md hover:border-blue-400 transition-all"
        >
          <h2 className="text-lg font-semibold mb-1">Company-Wise Questions</h2>
          <p className="text-sm text-gray-500">
            Practice LeetCode questions organized by company
          </p>
        </Link>
        <Link
          href="/practice/my-progress"
          className="block p-6 border rounded-xl bg-white hover:shadow-md hover:border-blue-400 transition-all"
        >
          <h2 className="text-lg font-semibold mb-1">My Progress</h2>
          <p className="text-sm text-gray-500">
            Track your attempted and solved questions
          </p>
        </Link>
      </div>
    </div>
  );
}
