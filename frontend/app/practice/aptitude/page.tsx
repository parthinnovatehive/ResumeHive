"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  fetchAptitudeCategories,
  fetchAptitudeQuestions,
  type Category,
  type AptitudeQuestion,
} from "@/lib/api/aptitude";

type PageView = "categories" | "levels" | "questions";

const OPTION_LABELS = ["A", "B", "C", "D"];

const LEVEL_ORDER: Record<string, number> = {
  Basic: 0,
  Intermediate: 1,
  Advanced: 2,
};

const LEVEL_DISPLAY: Record<string, string> = {
  Basic: "Easy",
  Intermediate: "Intermediate",
  Advanced: "Advanced",
};

function MarkdownTable({ block }: { block: string[] }) {
  const rows = block
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("|")) return null;
      return trimmed
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());
    })
    .filter((row): row is string[] => row !== null);

  const dataRows = rows.filter(
    (row) => !(row.length > 0 && row.every((cell) => /^:?-+:?$/.test(cell)))
  );

  if (dataRows.length === 0) return null;

  return (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {dataRows[0].map((cell, i) => (
              <th
                key={i}
                className="border border-gray-300 px-2 py-1.5 bg-gray-50 text-left font-semibold"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.slice(1).map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-gray-300 px-2 py-1.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuestionText({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("|")) {
      const block: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        block.push(lines[i]);
        i++;
      }
      elements.push(<MarkdownTable key={elements.length} block={block} />);
    } else {
      const textLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith("|")) {
        textLines.push(lines[i]);
        i++;
      }
      const cleaned = textLines.join("\n").replace(/\*\*/g, "");
      elements.push(
        <p key={elements.length} className="whitespace-pre-line leading-relaxed">
          {cleaned}
        </p>
      );
    }
  }

  return <div className="space-y-1">{elements}</div>;
}

export default function AptitudePage() {
  const [view, setView] = useState<PageView>("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<number, { selected: string; correct: boolean }>>({});

  useEffect(() => {
    fetchAptitudeCategories().then(setCategories).catch(() => {});
  }, []);

  const loadQuestions = useCallback(
    async (slug: string, level: string) => {
      setLoading(true);
      try {
        const res = await fetchAptitudeQuestions(slug, {
          level: level || undefined,
          limit: 500,
          offset: 0,
        });
        setQuestions(res.items);
        setTotal(res.total);
        setCurrentIndex(0);
        setSelectedOption(null);
        setAnswered(false);
      } catch {
        setQuestions([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedLevel("");
    setView("levels");
  };

  const handleSelectLevel = (level: string) => {
    setSelectedLevel(level);
    setScore(0);
    setTotalAnswered(0);
    setAnswersMap({});
    setView("questions");
    loadQuestions(selectedCategory!.slug, level);
  };

  const handleBackToCategories = () => {
    setView("categories");
    setSelectedCategory(null);
    setSelectedLevel("");
    setQuestions([]);
  };

  const handleBackToLevels = () => {
    setView("levels");
    setQuestions([]);
  };

  const handleSelectOption = (opt: string) => {
    if (answered) return;
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const q = questions[currentIndex];
    const correct = selectedOption === q.Correct_Option;
    setAnswered(true);
    setAnswersMap((prev) => ({
      ...prev,
      [currentIndex]: { selected: selectedOption, correct },
    }));
    setTotalAnswered((prev) => prev + 1);
    if (correct) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      const next = currentIndex + 1;
      const prevAnswer = answersMap[next];
      setSelectedOption(prevAnswer ? prevAnswer.selected : null);
      setAnswered(prevAnswer !== undefined);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      const prevIdx = currentIndex - 1;
      const prevAnswer = answersMap[prevIdx];
      setSelectedOption(prevAnswer ? prevAnswer.selected : null);
      setAnswered(prevAnswer !== undefined);
    }
  };

  if (view === "categories") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">Aptitude Practice</h1>
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border rounded-lg">
            No categories available.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleSelectCategory(cat)}
                className="block p-6 border rounded-xl bg-white hover:shadow-md hover:border-blue-400 transition-all text-left"
              >
                <h2 className="text-lg font-semibold mb-1">{cat.name}</h2>
                <p className="text-sm text-gray-500">
                  {cat.question_count} questions
                </p>
                {cat.levels.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {[...cat.levels]
                      .sort((a, b) => (LEVEL_ORDER[a] ?? 99) - (LEVEL_ORDER[b] ?? 99))
                      .map((l) => (
                        <span
                          key={l}
                          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                        >
                          {LEVEL_DISPLAY[l] ?? l}
                        </span>
                      ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "levels") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={handleBackToCategories}
          className="text-sm text-blue-600 hover:underline mb-6 inline-block"
        >
          &larr; Back to categories
        </button>
        <h1 className="text-xl font-bold mb-2">{selectedCategory?.name}</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a difficulty level</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[...(selectedCategory?.levels ?? [])]
            .sort((a, b) => (LEVEL_ORDER[a] ?? 99) - (LEVEL_ORDER[b] ?? 99))
            .map((l) => (
            <button
              key={l}
              onClick={() => handleSelectLevel(l)}
              className="p-6 border rounded-xl bg-white hover:shadow-md hover:border-blue-400 transition-all text-center"
            >
              <span className="text-lg font-semibold">{LEVEL_DISPLAY[l] ?? l}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center py-12 text-gray-500">Loading questions...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={handleBackToLevels}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Back to levels
        </button>
        <div className="text-center py-12 text-gray-400 border rounded-lg">
          No questions found for this level.
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const answer = answersMap[currentIndex];
  const isCorrect = answer?.correct;
  const correctLetter = q.Correct_Option;

  function optionColor(opt: string) {
    if (!answered) {
      return selectedOption === opt
        ? "border-blue-500 bg-blue-50"
        : "border-gray-200 bg-white hover:border-gray-300";
    }
    if (opt === correctLetter) {
      return "border-green-500 bg-green-50";
    }
    if (opt === selectedOption && !isCorrect) {
      return "border-red-500 bg-red-50";
    }
    return "border-gray-200 bg-white opacity-60";
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={handleBackToLevels}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to levels
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{selectedCategory?.name}</h1>
          <p className="text-sm text-gray-500">{LEVEL_DISPLAY[selectedLevel] ?? selectedLevel}</p>
        </div>
        <div className="text-sm text-gray-500">
          Score: {score}/{totalAnswered}
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        Question {currentIndex + 1} of {total}
      </div>

      <div className="border rounded-xl p-6 bg-white mb-6">
        <div className="text-base font-medium mb-6">
          <QuestionText text={q.Question} />
        </div>

        <div className="space-y-3">
          {OPTION_LABELS.map((label) => {
            const optKey = `Option_${label}` as keyof AptitudeQuestion;
            return (
              <button
                key={label}
                onClick={() => handleSelectOption(label)}
                className={`w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-sm transition-colors text-left ${optionColor(
                  label
                )}`}
              >
                <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-xs font-semibold shrink-0">
                  {label}
                </span>
                <span>{q[optKey]}</span>
              </button>
            );
          })}
        </div>

        {!answered ? (
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedOption}
            className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Check Answer
          </button>
        ) : (
          <div
            className={`mt-6 p-4 rounded-lg border ${
              isCorrect
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <p className="font-semibold mb-1">
              {isCorrect ? "Correct!" : "Wrong!"}
            </p>
            <p className="text-sm whitespace-pre-line leading-relaxed">{q.Solution}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          &larr; Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
