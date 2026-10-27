"use client";

import { useMemo, useState } from "react";
import MainContent from "@/components/blog/MainContent";
import type { Project, Tag } from "@/api/project-model";
import { useI18n } from "@/i18n/I18nProvider";
import { htmlLanguage, localePath } from "@/i18n/locales";

type ProjectListProps = {
  projects: Project[];
  title: string;
  intro: string;
};

function collectTags(projects: Project[], locale: string): Tag[] {
  const tagMap = new Map<string, Tag>();
  for (const project of projects) {
    for (const tag of project.tags ?? []) {
      const tagId = tag.documentId ?? `${tag.id}`;
      if (!tagMap.has(tagId)) tagMap.set(tagId, tag);
    }
  }
  return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name, htmlLanguage(locale)));
}

export default function ProjectList({ projects, title, intro }: ProjectListProps) {
  const { locale } = useI18n();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const allTags = useMemo(() => collectTags(projects, locale), [projects, locale]);
  const visibleProjects = useMemo(() => {
    if (selectedTagIds.length === 0) return projects;
    const selected = new Set(selectedTagIds);
    return projects.filter((project) =>
      (project.tags ?? []).some((tag) => selected.has(tag.documentId ?? `${tag.id}`)),
    );
  }, [projects, selectedTagIds]);

  return (
    <MainContent
      projects={visibleProjects}
      title={title}
      intro={intro}
      allTags={allTags}
      selectedTagIds={selectedTagIds}
      onTagToggle={setSelectedTagIds}
      projectHref={(project) => localePath(locale, `/projects/${encodeURIComponent(project.slug)}`)}
    />
  );
}
