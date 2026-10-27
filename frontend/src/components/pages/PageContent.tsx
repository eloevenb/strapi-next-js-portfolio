"use client";

import type { ReactNode } from "react";
import type { Project } from "../../api/project-model";
import type { SocialSource } from "../../lib/socials";
import { isContactBlock, isHomeBlock, isProjectsBlock, type PageBlock } from "../../api/page-blocks";
import { PublicationContent } from "../publication";
import ProjectList from "../projects/ProjectList";
import { ContactSection } from "./ContactSection";
import { HomeSection } from "./HomeSection";

type PageContentProps = {
  content: PageBlock[];
  projects: Project[];
  socials?: SocialSource;
};

export function PageContent({ content, projects, socials }: PageContentProps) {
  return (
    <PublicationContent
      content={content}
      renderAdditional={(component): ReactNode => {
        if (isHomeBlock(component)) return <HomeSection component={component} socials={socials} />;
        if (isContactBlock(component)) return <ContactSection component={component} socials={socials} />;
        if (isProjectsBlock(component)) {
          return <ProjectList projects={projects} title={component.title ?? ""} intro={component.intro ?? ""} />;
        }
        return null;
      }}
    />
  );
}
