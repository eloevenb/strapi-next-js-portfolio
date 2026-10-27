import { getProjects, type Project } from "../../api/projects";
import { isContactBlock, isHomeBlock, isProjectsBlock, type PageBlock } from "../../api/page-blocks";
import { getSocials, type Social } from "../../api/socials";
import type { Locale } from "../../i18n/locales";
import { highlightContent } from "../publication/highlightCode";
import { PageContent } from "./PageContent";

export async function PageBody({
  content,
  locale,
}: {
  content?: PageBlock[] | null;
  locale: Locale;
}) {
  const blocks = Array.isArray(content) ? content : [];
  const projects: Project[] = blocks.some(isProjectsBlock) ? ((await getProjects(locale)).data ?? []) : [];

  let socials: Social | undefined;
  if (blocks.some((block) => isHomeBlock(block) || isContactBlock(block))) {
    try {
      socials = (await getSocials()).data;
    } catch {
      socials = undefined;
    }
  }

  return <PageContent content={highlightContent(blocks)} projects={projects} socials={socials} />;
}
