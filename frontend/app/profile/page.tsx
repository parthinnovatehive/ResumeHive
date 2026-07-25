"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Briefcase,
  Wrench,
  Award,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  Building2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { authApi, type ProfileUpdatePayload, type UserProfile } from "@/lib/api/auth";
import { TagsInput } from "@/components/resume-builder/TagsInput";

type ExperienceForm = {
  title: string;
  company: string;
  date_range: string;
  description: string;
};

type EducationForm = {
  info: string;
  date_range: string;
};

type ProfileForm = {
  college_name: string;
  linkedin_url: string;
  linkedin_id: string;
  headline: string;
  about: string;
  top_skills: string[];
  certifications: string;
  experience: ExperienceForm[];
  education: EducationForm[];
};

type ProfileTextField = Exclude<keyof ProfileForm, "experience" | "education" | "top_skills">;

const textValue = (value: unknown) => (value === null || value === undefined ? "" : String(value));

const profileToForm = (profile: UserProfile): ProfileForm => ({
  college_name: profile.college_name ?? "",
  linkedin_url: profile.linkedin_url ?? "",
  linkedin_id: profile.linkedin_id ?? "",
  headline: profile.headline ?? "",
  about: profile.about ?? "",
  top_skills: profile.top_skills,
  certifications: profile.certifications.join(", "),
  experience: profile.experience.map((entry) => ({
    title: textValue(entry.title),
    company: textValue(entry.company),
    date_range: textValue(entry.date_range),
    description: textValue(entry.description),
  })),
  education: profile.education.map((entry) => ({
    info: textValue(entry.info),
    date_range: textValue(entry.date_range),
  })),
});

const TOP_SKILL_SUGGESTIONS = [
  "Python", "Java", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "HTML", "CSS", "SQL", "MongoDB", "Git", "Docker", "AWS", "Azure",
  "Machine Learning", "Data Analysis", "Data Science", "Artificial Intelligence",
  "Communication", "Leadership", "Problem Solving", "Project Management",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi().getProfile();
      setProfile(data);
      setForm(profileToForm(data));
    } catch {
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: ProfileTextField, value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const updateTopSkills = (top_skills: string[]) => {
    setForm((current) => (current ? { ...current, top_skills } : current));
  };

  const updateExperience = (index: number, field: keyof ExperienceForm, value: string) => {
    setForm((current) => {
      if (!current) return current;
      const experience = current.experience.map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, [field]: value } : entry,
      );
      return { ...current, experience };
    });
  };

  const updateEducation = (index: number, field: keyof EducationForm, value: string) => {
    setForm((current) => {
      if (!current) return current;
      const education = current.education.map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, [field]: value } : entry,
      );
      return { ...current, education };
    });
  };

  const handleSave = async () => {
    if (!form) return;
    setError(null);
    setSaveMessage(null);

    const splitItems = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
    const payload: ProfileUpdatePayload = {
      college_name: form.college_name.trim(),
      linkedin_url: form.linkedin_url.trim(),
      linkedin_id: form.linkedin_id.trim(),
      headline: form.headline.trim(),
      about: form.about.trim(),
      top_skills: form.top_skills,
      certifications: splitItems(form.certifications),
      experience: form.experience,
      education: form.education,
    };

    setSaving(true);
    try {
      const updated = await authApi().updateProfile(payload);
      setProfile(updated);
      setForm(profileToForm(updated));
      setEditing(false);
      setSaveMessage("Profile changes saved.");
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Could not save your profile changes.";
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-20">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-3 text-sm text-slate-500">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-20">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
          <button
            onClick={loadProfile}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          My Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          All data stored in your ResumeHive account.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/60 p-3 shadow-sm">
        <p className="text-sm text-slate-600">Update your saved profile information at any time.</p>
        <button
          type="button"
          onClick={() => {
            setEditing((current) => !current);
            setSaveMessage(null);
            if (profile) setForm(profileToForm(profile));
          }}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          {editing ? "Cancel editing" : "Edit profile"}
        </button>
        {saveMessage && <p className="w-full text-xs font-medium text-green-700">{saveMessage}</p>}
      </div>

      {editing && form && (
        <ProfileEditForm
          form={form}
          saving={saving}
          onChange={updateForm}
          onTopSkillsChange={updateTopSkills}
          onExperienceChange={updateExperience}
          onEducationChange={updateEducation}
          onSave={handleSave}
          onCancel={() => {
            setForm(profileToForm(profile));
            setEditing(false);
          }}
        />
      )}

      {/* Profile Header Card */}
      <div className="relative group overflow-hidden rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 p-6 shadow-sm transition-all hover:shadow-md hover:bg-white/60 mb-6">
        <div className="absolute inset-0 z-[-1] rounded-2xl bg-gradient-to-br from-premium-blue/10 to-premium-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-premium-blue to-premium-purple text-white text-xl font-bold shadow-lg">
            {profile.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-slate-900 truncate">
              {profile.email}
            </p>
            {profile.headline && (
              <p className="mt-0.5 text-sm font-medium leading-relaxed text-slate-600">
                {profile.headline}
              </p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <SectionCard title="Account Information" icon={<User className="h-4 w-4" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
          <InfoRow icon={<GraduationCap className="h-4 w-4" />} label="College" value={profile.college_name || "Not provided"} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Member Since" value={new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
        </div>
      </SectionCard>

      {/* LinkedIn Profile */}
      <SectionCard title="LinkedIn Profile" icon={<ExternalLink className="h-4 w-4" />}>
        {profile.linkedin_url ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow
              icon={<ExternalLink className="h-4 w-4" />}
              label="LinkedIn URL"
              value={
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A66C2] hover:underline font-medium"
                >
                  {profile.linkedin_url}
                </a>
              }
            />
            {profile.linkedin_id && (
              <InfoRow icon={<User className="h-4 w-4" />} label="LinkedIn ID" value={profile.linkedin_id} />
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No LinkedIn profile linked yet.</p>
        )}
      </SectionCard>

      {/* About */}
      <SectionCard title="About" icon={<FileText className="h-4 w-4" />}>
        {profile.about ? (
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {profile.about}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic">No about section provided.</p>
        )}
      </SectionCard>

      {/* Skills */}
      <SectionCard
        title="Top Skills"
        icon={<Wrench className="h-4 w-4" />}
        count={profile.top_skills.length}
      >
        {profile.top_skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.top_skills.map((skill, i) => (
              <span
                key={i}
                className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No skills saved yet.</p>
        )}
      </SectionCard>

      {/* Certifications */}
      <SectionCard
        title="Certifications"
        icon={<Award className="h-4 w-4" />}
        count={profile.certifications.length}
      >
        {profile.certifications.length > 0 ? (
          <div className="space-y-2">
            {profile.certifications.map((cert, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 border border-slate-100">
                <Award className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">{cert}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No certifications saved yet.</p>
        )}
      </SectionCard>

      {/* Experience */}
      <SectionCard
        title="Experience"
        icon={<Briefcase className="h-4 w-4" />}
        count={profile.experience.length}
      >
        {profile.experience.length > 0 ? (
          <div className="space-y-3">
            {profile.experience.map((entry, i) => (
              <div key={i} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                {Boolean(entry.title) && (
                  <p className="text-sm font-semibold text-slate-800">{String(entry.title)}</p>
                )}
                {Boolean(entry.company) && (
                  <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Building2 className="h-3 w-3" />
                    {String(entry.company)}
                  </p>
                )}
                {Boolean(entry.date_range) && (
                  <p className="text-xs text-slate-400 mt-0.5">{String(entry.date_range)}</p>
                )}
                {Boolean(entry.description) && (
                  <p className="mt-2 text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                    {String(entry.description)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No experience saved yet.</p>
        )}
      </SectionCard>

      {/* Education */}
      <SectionCard
        title="Education"
        icon={<BookOpen className="h-4 w-4" />}
        count={profile.education.length}
      >
        {profile.education.length > 0 ? (
          <div className="space-y-3">
            {profile.education.map((entry, i) => (
              <div key={i} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                {Boolean(entry.info) && (
                  <p className="text-sm font-medium text-slate-700">{String(entry.info)}</p>
                )}
                {Boolean(entry.date_range) && (
                  <p className="text-xs text-slate-400 mt-0.5">{String(entry.date_range)}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No education saved yet.</p>
        )}
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Edit Profile                                  */
/* -------------------------------------------------------------------------- */

function ProfileEditForm({
  form,
  saving,
  onChange,
  onTopSkillsChange,
  onExperienceChange,
  onEducationChange,
  onSave,
  onCancel,
}: {
  form: ProfileForm;
  saving: boolean;
  onChange: (field: ProfileTextField, value: string) => void;
  onTopSkillsChange: (skills: string[]) => void;
  onExperienceChange: (index: number, field: keyof ExperienceForm, value: string) => void;
  onEducationChange: (index: number, field: keyof EducationForm, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const fields: Array<{ field: ProfileTextField; label: string; placeholder?: string; textarea?: boolean; hint?: string }> = [
    { field: "college_name", label: "College", placeholder: "Your college or university" },
    { field: "linkedin_url", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/your-profile" },
    { field: "linkedin_id", label: "LinkedIn ID", placeholder: "your-profile" },
    { field: "headline", label: "Headline", placeholder: "Your professional headline" },
    { field: "about", label: "About", textarea: true, placeholder: "Tell employers about yourself" },
    { field: "certifications", label: "Certifications", placeholder: "AWS Certified, Google Analytics", hint: "Separate certifications with commas." },
  ];

  return (
    <section className="mb-6 rounded-2xl border border-[#0A66C2]/20 bg-[#0A66C2]/[0.04] p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-800">Edit profile</h2>
      <p className="mt-1 text-xs text-slate-500">Changes are saved directly to your ResumeHive account.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map(({ field, label, placeholder, textarea, hint }) => (
          <label key={field} className={textarea ? "sm:col-span-2" : ""}>
            <span className="text-xs font-semibold text-slate-700">{label}</span>
            {textarea ? (
              <textarea
                value={form[field]}
                onChange={(event) => onChange(field, event.target.value)}
                placeholder={placeholder}
                rows={4}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
              />
            ) : (
              <input
                value={form[field]}
                onChange={(event) => onChange(field, event.target.value)}
                placeholder={placeholder}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
              />
            )}
            {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
          </label>
        ))}
      </div>

      <div className="mt-4">
        <TagsInput
          label="Top skills"
          value={form.top_skills}
          onChange={onTopSkillsChange}
          suggestions={TOP_SKILL_SUGGESTIONS}
          placeholder="Search or add a skill"
        />
        <p className="mt-1 text-[11px] text-slate-500">Search the dropdown, select multiple skills, or type a custom skill and press Enter.</p>
      </div>

      <div className="mt-5 border-t border-[#0A66C2]/15 pt-5">
        <h3 className="text-sm font-semibold text-slate-800">Experience</h3>
        <p className="mt-1 text-xs text-slate-500">The extracted field structure is fixed; you can edit only these values.</p>
        {form.experience.length > 0 ? (
          <div className="mt-3 space-y-4">
            {form.experience.map((entry, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-white/70 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Experience {index + 1}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <EditInput label="Title" value={entry.title} onChange={(value) => onExperienceChange(index, "title", value)} />
                  <EditInput label="Company" value={entry.company} onChange={(value) => onExperienceChange(index, "company", value)} />
                  <EditInput label="Date range" value={entry.date_range} onChange={(value) => onExperienceChange(index, "date_range", value)} />
                  <EditInput label="Description" value={entry.description} textarea onChange={(value) => onExperienceChange(index, "description", value)} className="sm:col-span-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm italic text-slate-400">No experience entries are saved yet.</p>
        )}
      </div>

      <div className="mt-5 border-t border-[#0A66C2]/15 pt-5">
        <h3 className="text-sm font-semibold text-slate-800">Education</h3>
        <p className="mt-1 text-xs text-slate-500">The extracted field structure is fixed; you can edit only these values.</p>
        {form.education.length > 0 ? (
          <div className="mt-3 space-y-4">
            {form.education.map((entry, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-white/70 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Education {index + 1}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <EditInput label="Institution / degree" value={entry.info} onChange={(value) => onEducationChange(index, "info", value)} />
                  <EditInput label="Date range" value={entry.date_range} onChange={(value) => onEducationChange(index, "date_range", value)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm italic text-slate-400">No education entries are saved yet.</p>
        )}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004182] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Cancel
        </button>
      </div>
    </section>
  );
}

function EditInput({
  label,
  value,
  onChange,
  textarea = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
        />
      )}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Section Card                                  */
/* -------------------------------------------------------------------------- */

function SectionCard({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-4 rounded-2xl bg-white/60 backdrop-blur border border-white/60 shadow-sm overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-slate-500">{icon}</span>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {count !== undefined && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              {count}
            </span>
          )}
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {!collapsed && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Info Row                                      */
/* -------------------------------------------------------------------------- */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 p-3 border border-slate-100">
      <span className="mt-0.5 text-slate-400 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-slate-700 truncate">{value}</div>
      </div>
    </div>
  );
}
