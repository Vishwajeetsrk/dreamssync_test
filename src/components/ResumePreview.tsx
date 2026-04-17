'use client';

import React from 'react';
import { Mail, Phone, Globe, MapPin } from 'lucide-react';

export interface ResumeData {
  personalInfo: {
    fullName: string;
    role: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website?: string;
    portfolio?: string;
  };
  summary: string;
  skills: {
    category: string;
    items: string;
  }[];
  experience: {
    company: string;
    role: string;
    location: string;
    date: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree: string;
    location: string;
    date: string;
  }[];
  projects?: {
    name: string;
    link?: string;
    description: string;
  }[];
  achievements?: string[];
  languages?: string[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    link?: string;
  }[];
  extra?: string;
}

interface ResumePreviewProps {
  data: ResumeData;
  template?: 'elite' | 'strategic' | 'modern';
}

const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(({ data, template = 'faang_standard' }, ref) => {
  const { personalInfo, summary, skills, experience, education, projects, achievements, languages, certifications, extra } = data;

  // Template Specific Styles
  const isElite = template === 'elite';
  const isStrategic = template === 'strategic';
  
  const sectionTitleClass = isElite 
    ? "text-[14px] font-bold text-slate-900 uppercase tracking-tight border-b-2 border-slate-900 pb-0.5 mb-2 mt-4" 
    : isStrategic 
      ? "text-[13px] font-bold text-blue-700 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2 mt-4"
      : "text-[14px] font-black uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-1 mb-3 mt-6";

  const bulletClass = "text-[12px] text-gray-900 leading-[1.5] mb-1 list-disc ml-4 pl-1";
  const subTitleClass = "text-[13px] font-bold text-black";
  const dateClass = "text-[12px] font-bold text-gray-700 italic";
  const textClass = "text-[12px] text-gray-900 leading-[1.6]";
  
  // A4 Layout Consistency
  const containerClass = `bg-white text-black px-12 py-12 mx-auto w-full max-w-[800px] min-h-[1123px] shadow-none ${isElite ? 'font-sans' : isStrategic ? 'font-serif' : 'font-sans'}`;

  return (
    <div 
      ref={ref}
      className={containerClass}
      id="resume-content"
      style={{ 
        pageBreakBefore: 'always', 
        WebkitPrintColorAdjust: 'exact',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <header className={`text-center ${isElite ? 'mb-4' : 'mb-6'}`}>
        <h1 className={`text-4xl uppercase tracking-tighter mb-1 font-black ${isElite ? 'text-slate-900' : isStrategic ? 'text-blue-700' : 'text-slate-900'}`}>{personalInfo.fullName || 'YOUR NAME'}</h1>
        <p className={`text-lg mb-3 ${isElite ? 'font-bold text-slate-700' : 'font-bold text-slate-600 italic tracking-wide'}`}>{personalInfo.role?.toUpperCase() || 'PROFESSIONAL ROLE'}</p>
        
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[11px] font-bold text-gray-800">
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.email && <span className="">{personalInfo.email}</span>}
          {personalInfo.location && <span>{personalInfo.location?.toUpperCase()}</span>}
          {personalInfo.linkedin && <span className="">LINKEDIN.COM/IN/{personalInfo.linkedin.replace(/.*\/in\//, '').replace(/\/$/, '').toUpperCase()}</span>}
          {personalInfo.github && <span className="">GITHUB.COM/{personalInfo.github.replace(/.*github.com\//, '').replace(/\/$/, '').toUpperCase()}</span>}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section>
          <h2 className={sectionTitleClass}>Professional Profile</h2>
          <p className={textClass}>{summary}</p>
        </section>
      )}

      {/* Skills */}
      <section>
        <h2 className={sectionTitleClass}>Technical Core</h2>
        <div className="space-y-1.5">
          {skills.map((skill, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span className="text-[12px] font-black w-40 shrink-0 uppercase tracking-tighter">{skill.category}:</span>
              <span className={textClass}>{skill.items}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section>
        <h2 className={sectionTitleClass}>Professional Experience</h2>
        <div className="space-y-5">
          {experience.map((exp, idx) => (
            <div key={idx} className="break-inside-avoid">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className={subTitleClass}>{exp.role?.toUpperCase()}</h3>
                <span className={dateClass}>{exp.date?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[12px] font-black italic text-slate-800">{exp.company?.toUpperCase()}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{exp.location}</span>
              </div>
              <ul className="mt-1 space-y-1">
                {exp.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className={bulletClass}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section>
          <h2 className={sectionTitleClass}>Technical Engineering Projects</h2>
          <div className="space-y-4">
            {projects.map((proj, idx) => (
              <div key={idx} className="break-inside-avoid">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={subTitleClass}>{proj.name?.toUpperCase()}</h3>
                  {proj.link && <span className="text-[10px] text-blue-600 font-bold underline italic">{proj.link}</span>}
                </div>
                <p className={textClass}>{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      <section>
        <h2 className={sectionTitleClass}>Academic Qualifications</h2>
        <div className="space-y-3">
          {education.map((edu, idx) => (
            <div key={idx} className="flex justify-between items-baseline break-inside-avoid">
              <div>
                <h3 className={subTitleClass}>{edu.school?.toUpperCase()}</h3>
                <p className="text-[11px] font-bold text-gray-700">{edu.degree?.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <span className={dateClass}>{edu.date}</span>
                <p className="text-[10px] font-bold text-gray-500 uppercase">{edu.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Languages & Achievements Grid */}
      <div className="grid grid-cols-2 gap-10 mt-2">
        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <section>
            <h2 className={sectionTitleClass}>Key Honors</h2>
            <ul className="space-y-1">
              {achievements.map((ach, idx) => (
                <li key={idx} className={bulletClass}>{ach}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <section>
            <h2 className={sectionTitleClass}>Languages</h2>
            <p className={textClass + " font-bold italic"}>{languages.join(", ")?.toUpperCase()}</p>
          </section>
        )}
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
