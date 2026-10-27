'use strict';

const { ValidationError } = require('@strapi/utils').errors;
const { PAGE_UID, enforceSingleHomePage } = require('./content/home-page');
const { ensureSite } = require('./seed/site');

const SLUG_UIDS = ['api::project.project', 'api::publication.publication', PAGE_UID];

async function assertSlugAvailable(strapi, context) {
  const slug = context.params?.data?.slug;
  if (typeof slug !== 'string' || slug.length === 0) return;

  const documentId = context.params.documentId;
  const conflict = await strapi.db.query(context.uid).findOne({
    where: {
      slug,
      ...(documentId ? { documentId: { $ne: documentId } } : {}),
    },
    select: ['id'],
  });

  if (conflict) {
    throw new ValidationError('This slug is already used by another entry.');
  }
}

module.exports = {
  register({ strapi }) {
    strapi.documents.use(async (context, next) => {
      if (SLUG_UIDS.includes(context.uid) && (context.action === 'create' || context.action === 'update')) {
        await assertSlugAvailable(strapi, context);
      }

      if (context.uid === PAGE_UID) {
        return enforceSingleHomePage(strapi, context, next);
      }

      return next();
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    await ensureLocales(strapi);
    await shareSlugs(strapi, 'api::project.project');
    await shareSlugs(strapi, 'api::publication.publication');
    await ensureSite(strapi);
    await shareSlugs(strapi, PAGE_UID);

    const publicRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) {
      return;
    }

    const publicActions = [
      'api::tag.tag.find',
      'api::tag.tag.findOne',
      'api::project.project.find',
      'api::project.project.findOne',
      'api::publication.publication.find',
      'api::publication.publication.findOne',
      'api::site-setting.site-setting.find',
      'api::site-setting.site-setting.findOne',
      'api::social.social.find',
      'api::social.social.findOne',
      'api::page.page.find',
      'api::page.page.findOne',
      'api::app-bar.app-bar.find',
      'api::app-bar.app-bar.findOne',
      'api::site.site.find',
      'api::site.site.findOne',
      'plugin::i18n.locales.listLocales',
      'plugin::users-permissions.user.find',
      'plugin::users-permissions.user.findOne',
    ];

    for (const action of publicActions) {
      const existingPermission = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({
          where: {
            action,
            role: publicRole.id,
          },
        });

      if (!existingPermission) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: {
            action,
            role: publicRole.id,
          },
        });
      }
    }
  },
};

/** Keep the public site to English (United States) and French. */
async function ensureLocales(strapi) {
  const locales = strapi.plugin('i18n').service('locales');
  const englishName = 'English (United States)';
  const frenchName = 'French (fr)';

  const english = await locales.findByCode('en');
  if (!english) {
    await locales.create({ code: 'en', name: englishName });
  } else if (english.name !== englishName) {
    await locales.update({ id: english.id }, { name: englishName });
  }

  const french = await locales.findByCode('fr');
  if (!french) {
    await locales.create({ code: 'fr', name: frenchName });
  } else if (french.name !== frenchName) {
    await locales.update({ id: french.id }, { name: frenchName });
  }

  const defaultLocale = await locales.getDefaultLocale();
  if (!defaultLocale) {
    await locales.setDefaultLocale({ code: 'en' });
  }
}

/** Copy the default-locale slug onto every translation of the same document. */
async function shareSlugs(strapi, uid) {
  const defaultLocale = await strapi.plugin('i18n').service('locales').getDefaultLocale();
  const rows = await strapi.db.query(uid).findMany({
    select: ['documentId', 'locale', 'slug', 'publishedAt'],
  });
  const groups = new Map();

  for (const row of rows) {
    const list = groups.get(row.documentId) ?? [];
    list.push(row);
    groups.set(row.documentId, list);
  }

  for (const [documentId, list] of groups) {
    const canonical =
      list.find((row) => row.locale === defaultLocale && row.publishedAt && row.slug) ??
      list.find((row) => row.locale === defaultLocale && row.slug) ??
      list.find((row) => row.slug);

    if (!canonical?.slug) continue;

    const taken = await strapi.db.query(uid).findOne({
      where: { slug: canonical.slug, documentId: { $ne: documentId } },
      select: ['id'],
    });
    if (taken) {
      strapi.log.warn(
        `Left translations of ${uid} ${documentId} unchanged: slug "${canonical.slug}" is already used by another entry.`,
      );
      continue;
    }

    const locales = [
      ...new Set(list.filter((row) => row.slug !== canonical.slug).map((row) => row.locale)),
    ];

    for (const locale of locales) {
      await strapi.db.query(uid).updateMany({
        where: { documentId, locale },
        data: { slug: canonical.slug },
      });
    }
  }
}
