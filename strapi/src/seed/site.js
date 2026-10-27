'use strict';

const SITE_UID = 'api::site.site';
const PAGE_UID = 'api::page.page';
const APP_BAR_UID = 'api::app-bar.app-bar';

const LOCALES = ['en', 'fr'];

function text(value) {
  return { type: 'text', text: value };
}

function link(url, label) {
  return { type: 'link', url, children: [text(label)] };
}

function heading(level, value) {
  return { type: 'heading', level, children: [text(value)] };
}

function paragraph(value) {
  return { type: 'paragraph', children: [text(value)] };
}

function richParagraph(children) {
  return { type: 'paragraph', children };
}

function blocks(nodes) {
  return [{ __component: 'text.paragraph', content: nodes }];
}

const interfaceCopy = {
  en: {
    openMenu: 'Open menu',
    language: 'Language',
    projectsEmpty: 'No projects have been published yet.',
    projectsNoMatch: 'No projects match the selected tags.',
    projectsAllCategories: 'All categories',
    projectsProject: 'Project',
    projectsFallbackTitle: 'Project',
    publicationCountOne: '1 publication',
    publicationCountMany: '{count} publications',
    pageLabel: 'Page {page}',
    noPublications: 'No publications for this project yet.',
    tableOfContents: 'Table of contents',
    contents: 'Contents',
    codeCopied: 'Copied',
    codeCopy: 'Copy code',
    themeSwitch: 'Switch theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    imageOpen: 'Open image: {alt}',
    imagePrevious: 'Previous image',
    imageNext: 'Next image',
    imageZoomIn: 'Zoom in',
    imageZoomOut: 'Zoom out',
    imageClose: 'Close',
  },
  fr: {
    openMenu: 'Ouvrir le menu',
    language: 'Langue',
    projectsEmpty: "Aucun projet n'a encore été publié.",
    projectsNoMatch: 'Aucun projet ne correspond aux tags sélectionnés.',
    projectsAllCategories: 'Toutes les catégories',
    projectsProject: 'Projet',
    projectsFallbackTitle: 'Projet',
    publicationCountOne: '1 publication',
    publicationCountMany: '{count} publications',
    pageLabel: 'Page {page}',
    noPublications: 'Aucune publication pour ce projet pour le moment.',
    tableOfContents: 'Table des matières',
    contents: 'Sommaire',
    codeCopied: 'Copié',
    codeCopy: 'Copier le code',
    themeSwitch: 'Changer le thème',
    themeSystem: 'Système',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    imageOpen: "Ouvrir l'image : {alt}",
    imagePrevious: 'Image précédente',
    imageNext: 'Image suivante',
    imageZoomIn: 'Agrandir',
    imageZoomOut: 'Réduire',
    imageClose: 'Fermer',
  },
};

const copy = {
  en: {
    identity: {
      siteName: 'Portfolio',
      description: 'A collection of projects and publications built over time.',
    },
    footer: {
      pages: 'Pages',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      copyright: 'Copyright ©',
    },
    interface: interfaceCopy.en,
  },
  fr: {
    identity: {
      siteName: 'Portfolio',
      description: 'Une collection de projets et de publications, au fil du temps.',
    },
    footer: {
      pages: 'Pages',
      privacy: 'Politique de confidentialité',
      terms: "Conditions d'utilisation",
      copyright: 'Copyright ©',
    },
    interface: interfaceCopy.fr,
  },
};

const homeCopy = {
  en: {
    eyebrow: 'Portfolio',
    title: 'Full-stack developer & security enthusiast',
    intro:
      'Welcome to my portfolio. I build clean, reliable web applications and enjoy exploring cybersecurity challenges in my free time. Have a look around and feel free to get in touch.',
    viewProjects: 'View projects',
    contact: 'Contact me',
    findMe: 'Find me online',
  },
  fr: {
    eyebrow: 'Portfolio',
    title: 'Développeur full-stack et passionné de sécurité',
    intro:
      "Bienvenue sur mon portfolio. Je conçois des applications web claires et fiables, et j'explore la cybersécurité sur mon temps libre. Faites le tour, et n'hésitez pas à me contacter.",
    viewProjects: 'Voir les projets',
    contact: 'Me contacter',
    findMe: 'Me trouver en ligne',
  },
};

const contactCopy = {
  en: {
    eyebrow: 'Get in touch',
    title: 'Contact',
    intro:
      'Whether you want to collaborate, have a question, or just want to say hi, feel free to reach out. I will get back to you as soon as I can.',
  },
  fr: {
    eyebrow: 'Écrire',
    title: 'Contact',
    intro:
      'Pour une collaboration, une question ou simplement un bonjour, écrivez-moi. Je vous répondrai dès que possible.',
  },
};

const projectsCopy = {
  en: {
    title: 'Projects',
    intro: 'Selected work and experiments, built over time.',
  },
  fr: {
    title: 'Projets',
    intro: "Une sélection de travaux et d'expériences, construits au fil du temps.",
  },
};

const pageDefinitions = [
  {
    slug: 'home',
    isHome: true,
    component: 'page.home',
    en: { title: 'Home' },
    fr: { title: 'Accueil' },
    content(locale) {
      return [{ __component: 'page.home', ...homeCopy[locale] }];
    },
  },
  {
    slug: 'projects',
    isHome: false,
    component: 'page.projects',
    en: { title: 'Projects' },
    fr: { title: 'Projets' },
    content(locale) {
      return [{ __component: 'page.projects', ...projectsCopy[locale] }];
    },
  },
  {
    slug: 'contact',
    isHome: false,
    component: 'page.contact',
    en: { title: 'Contact' },
    fr: { title: 'Contact' },
    content(locale) {
      return [{ __component: 'page.contact', ...contactCopy[locale] }];
    },
  },
  {
    slug: '404',
    isHome: false,
    component: 'text.paragraph',
    en: { title: 'Page not found' },
    fr: { title: 'Page introuvable' },
    content(locale) {
      if (locale === 'fr') {
        return blocks([
          heading(1, 'Page introuvable'),
          paragraph("La page que vous cherchez n'existe pas."),
          richParagraph([link('/', "Retour à l'accueil")]),
        ]);
      }
      return blocks([
        heading(1, 'Page not found'),
        paragraph('The page you are looking for does not exist.'),
        richParagraph([link('/', 'Go home')]),
      ]);
    },
  },
];

const pagePopulate = { content: true };

function contentOf(page) {
  return Array.isArray(page?.content) ? page.content : [];
}

function hasComponent(page, component) {
  return contentOf(page).some((block) => block.__component === component);
}

async function loadPage(strapi, documentId, locale) {
  const draft = await strapi.documents(PAGE_UID).findOne({
    documentId,
    locale,
    populate: pagePopulate,
  });
  if (contentOf(draft).length > 0) return draft;
  return strapi.documents(PAGE_UID).findOne({
    documentId,
    locale,
    status: 'published',
    populate: pagePopulate,
  });
}

async function savePageLocale(strapi, documentId, locale, data) {
  await strapi.documents(PAGE_UID).update({
    documentId,
    locale,
    data,
  });
  await strapi.documents(PAGE_UID).publish({
    documentId,
    locale,
  });
}

async function ensureLocalizedPage(strapi, definition) {
  const existing = await strapi.documents(PAGE_UID).findFirst({
    locale: 'en',
    filters: { slug: { $eq: definition.slug } },
  });

  if (!existing) {
    const english = await strapi.documents(PAGE_UID).create({
      locale: 'en',
      status: 'published',
      data: {
        title: definition.en.title,
        slug: definition.slug,
        isHome: definition.isHome,
        content: definition.content('en'),
      },
    });

    await strapi.documents(PAGE_UID).update({
      documentId: english.documentId,
      locale: 'fr',
      status: 'published',
      data: {
        title: definition.fr.title,
        slug: definition.slug,
        isHome: definition.isHome,
        content: definition.content('fr'),
      },
    });

    strapi.log.info(`Created the ${definition.slug} page.`);
    return { documentId: english.documentId, slug: definition.slug };
  }

  const english = await loadPage(strapi, existing.documentId, 'en');
  if (!hasComponent(english, definition.component)) {
    for (const locale of LOCALES) {
      await savePageLocale(strapi, existing.documentId, locale, {
        content: definition.content(locale),
      });
    }
    strapi.log.info(`Set ${definition.slug} page content to ${definition.component}.`);
  }

  return { documentId: existing.documentId, slug: existing.slug ?? definition.slug };
}

function homeBlockFrom(item, locale, projectsId, contactId) {
  const seeded = homeCopy[locale];
  return {
    id: item.id,
    __component: 'page.home',
    eyebrow: item.eyebrow || seeded.eyebrow,
    title: item.title || seeded.title,
    intro: item.intro || seeded.intro,
    viewProjects: item.viewProjects || seeded.viewProjects,
    contact: item.contact || seeded.contact,
    findMe: item.findMe || seeded.findMe,
    projectsPage: { connect: [projectsId] },
    contactPage: { connect: [contactId] },
  };
}

function isLinked(value) {
  return Boolean(value && (value.documentId || value.id));
}

/** Point the home buttons at the projects and contact pages once those pages exist. */
async function ensureHomeTargets(strapi, pages) {
  const home = pages.find((page) => page.slug === 'home');
  const projects = pages.find((page) => page.slug === 'projects');
  const contact = pages.find((page) => page.slug === 'contact');
  if (!home?.documentId || !projects?.documentId || !contact?.documentId) return;

  const populate = {
    content: {
      on: {
        'page.home': { populate: { projectsPage: true, contactPage: true } },
      },
    },
  };

  const english = await strapi.documents(PAGE_UID).findOne({
    documentId: home.documentId,
    locale: 'en',
    populate,
  });
  const englishBlock = contentOf(english).find((block) => block.__component === 'page.home');
  if (!englishBlock || (isLinked(englishBlock.projectsPage) && isLinked(englishBlock.contactPage))) return;

  for (const locale of LOCALES) {
    const localized = await strapi.documents(PAGE_UID).findOne({
      documentId: home.documentId,
      locale,
      populate,
    });
    const content = contentOf(localized).map((block) => {
      if (block.__component !== 'page.home') return block;
      return homeBlockFrom(block, locale, projects.documentId, contact.documentId);
    });
    if (!content.some((block) => block.__component === 'page.home')) continue;

    await savePageLocale(strapi, home.documentId, locale, { content });
  }

  strapi.log.info('Linked the home page buttons to the projects and contact pages.');
}

async function ensurePages(strapi) {
  const pages = [];
  for (const definition of pageDefinitions) {
    pages.push(await ensureLocalizedPage(strapi, definition));
  }
  await ensureHomeTargets(strapi, pages);
  return pages;
}

async function writeAppBarLinks(strapi, documentId, links) {
  for (const locale of LOCALES) {
    const existing = await strapi.documents(APP_BAR_UID).findOne({ documentId, locale });
    if (!existing) continue;
    await strapi.documents(APP_BAR_UID).update({
      documentId,
      locale,
      data: { links },
    });
    await strapi.documents(APP_BAR_UID).publish({ documentId, locale });
  }
}

async function ensureAppBar(strapi, pages) {
  const menuPages = pages.filter((page) => page.documentId);
  const menuLinks = menuPages.map((page) => ({ page: { connect: [page.documentId] } }));

  const existing = await strapi.documents(APP_BAR_UID).findFirst({
    locale: 'en',
    populate: { links: { populate: ['page'] } },
  });

  if (!existing) {
    const english = await strapi.documents(APP_BAR_UID).create({
      locale: 'en',
      status: 'published',
      data: { title: 'Portfolio', links: menuLinks },
    });

    await strapi.documents(APP_BAR_UID).update({
      documentId: english.documentId,
      locale: 'fr',
      status: 'published',
      data: { title: 'Portfolio', links: menuLinks },
    });
    return;
  }

  const currentIds = (existing.links ?? []).map((link) => link.page?.documentId).filter(Boolean);
  const menuIds = menuPages.map((page) => page.documentId);
  const missing = menuPages.filter((page) => !currentIds.includes(page.documentId));
  if (missing.length === 0) return;

  const hasCustomLink = currentIds.some((id) => !menuIds.includes(id));
  const links = hasCustomLink
    ? [
        ...currentIds.map((id) => ({ page: { connect: [id] } })),
        ...missing.map((page) => ({ page: { connect: [page.documentId] } })),
      ]
    : menuLinks;

  await writeAppBarLinks(strapi, existing.documentId, links);
  strapi.log.info('Added the projects page to the app bar.');
}

async function ensureSite(strapi) {
  const pages = await ensurePages(strapi);
  const bySlug = new Map(pages.map((page) => [page.slug, page]));
  const menu = ['home', 'projects', 'contact'].map((slug) => bySlug.get(slug)).filter(Boolean);
  await ensureAppBar(strapi, menu);

  const existing = await strapi.documents(SITE_UID).findFirst({
    locale: 'en',
    populate: ['interface'],
  });

  if (!existing) {
    const english = await strapi.documents(SITE_UID).create({
      locale: 'en',
      status: 'published',
      data: copy.en,
    });

    await strapi.documents(SITE_UID).update({
      documentId: english.documentId,
      locale: 'fr',
      status: 'published',
      data: copy.fr,
    });
    return;
  }

  await ensureInterfaceCopy(strapi, existing.documentId);
}

const interfaceKeys = Object.keys(interfaceCopy.en);

function interfaceNeedsCopy(current) {
  return interfaceKeys.some((key) => typeof current?.[key] !== 'string' || current[key].length === 0);
}

function mergedInterface(current, defaults) {
  const data = {};
  for (const key of interfaceKeys) {
    const value = current?.[key];
    data[key] = typeof value === 'string' && value.length > 0 ? value : defaults[key];
  }
  return data;
}

async function ensureInterfaceCopy(strapi, documentId) {
  for (const locale of LOCALES) {
    const entry = await strapi.documents(SITE_UID).findFirst({
      locale,
      populate: ['interface'],
    });
    if (!interfaceNeedsCopy(entry?.interface)) continue;

    await strapi.documents(SITE_UID).update({
      documentId,
      locale,
      status: 'published',
      data: { interface: mergedInterface(entry?.interface, interfaceCopy[locale]) },
    });
    strapi.log.info(`Filled missing ${locale} interface copy.`);
  }
}

module.exports = { ensureSite };
