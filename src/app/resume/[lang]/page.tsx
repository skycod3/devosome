import { notFound } from "next/navigation";
import { RESUME, type Locale } from "@/constants/resume-content";

export function generateStaticParams(): { lang: Locale }[] {
  return [{ lang: "en" }, { lang: "pt" }];
}

function isLocale(value: string): value is Locale {
  return value === "en" || value === "pt";
}

export default async function ResumePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const c = RESUME[lang];

  return (
    <main className="resume-root">
      <h1 className="resume-name">{c.name}</h1>
      <p className="resume-headline">{c.headline}</p>
      <p className="resume-meta">
        {c.contact.location} &nbsp;·&nbsp; {c.contact.email} &nbsp;·&nbsp;{" "}
        {c.contact.linkedin} &nbsp;·&nbsp; {c.contact.github}
      </p>

      <div className="resume-rule" />

      <div className="resume-block">
        <p className="resume-summary">{c.summary}</p>
      </div>

      <div className="resume-block">
        <p className="resume-section-title">{c.sectionTitles.experience}</p>
        {c.experience.map((job) => (
          <div className="resume-job" key={`${job.company}-${job.period}`}>
            <div className="resume-role-row">
              <div>
                <p className="resume-role">{job.role}</p>
                <p className="resume-company">{job.company}</p>
              </div>
              <span className="resume-period">{job.period}</span>
            </div>
            <ul className="resume-bullets">
              {job.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="resume-block">
        <p className="resume-section-title">{c.sectionTitles.skills}</p>
        <div className="resume-chips">
          {c.skills.map((s) => (
            <span
              className={`resume-chip${s.emphasis ? " is-emphasis" : ""}`}
              key={s.label}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="resume-block">
        <p className="resume-section-title">{c.sectionTitles.project}</p>
        <div className="resume-role-row">
          <div>
            <p className="resume-role">{c.project.name}</p>
            <p className="resume-company">{c.project.stack}</p>
          </div>
          <span className="resume-period">{c.project.link}</span>
        </div>
      </div>

      <div className="resume-block">
        <p className="resume-section-title">{c.sectionTitles.footer}</p>
        <p className="resume-footer-row">
          <strong>{c.educationLabel}:</strong> {c.education}
          {"  ·  "}
          <strong>{c.languagesLabel}:</strong> {c.languages}
        </p>
      </div>
    </main>
  );
}
