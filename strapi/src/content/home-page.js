'use strict';

const { ValidationError } = require('@strapi/utils').errors;

const PAGE_UID = 'api::page.page';

const HOME_REQUIRED = 'Exactly one page must be the home page.';
const HOME_DELETE =
  'Exactly one page must be the home page. Set another page as the home page before deleting this one.';

function versionWhere(published) {
  return published ? { publishedAt: { $notNull: true } } : { publishedAt: { $null: true } };
}

function isPublishedWrite(context) {
  return context.action === 'publish' || context.params?.status === 'published';
}

async function documentIsHome(strapi, documentId, published) {
  if (!documentId) return false;
  const row = await strapi.db.query(PAGE_UID).findOne({
    where: { documentId, isHome: true, ...versionWhere(published) },
    select: ['id'],
  });
  return Boolean(row);
}

async function hasOtherHomePage(strapi, documentId, published) {
  const row = await strapi.db.query(PAGE_UID).findOne({
    where: {
      isHome: true,
      ...versionWhere(published),
      ...(documentId ? { documentId: { $ne: documentId } } : {}),
    },
    select: ['id'],
  });
  return Boolean(row);
}

/** Setting a page as home clears the flag on every other page of the same draft or published version. */
async function clearOtherHomePages(strapi, documentId, published) {
  await strapi.db.query(PAGE_UID).updateMany({
    where: {
      isHome: true,
      ...versionWhere(published),
      ...(documentId ? { documentId: { $ne: documentId } } : {}),
    },
    data: { isHome: false },
  });
}

async function enforceSingleHomePage(strapi, context, next) {
  if (context.uid !== PAGE_UID) return next();

  if (context.action === 'delete') {
    const documentId = context.params?.documentId;
    for (const published of [false, true]) {
      if (
        (await documentIsHome(strapi, documentId, published)) &&
        !(await hasOtherHomePage(strapi, documentId, published))
      ) {
        throw new ValidationError(HOME_DELETE);
      }
    }
    return next();
  }

  if (context.action === 'unpublish') {
    const documentId = context.params?.documentId;
    if (
      (await documentIsHome(strapi, documentId, true)) &&
      !(await hasOtherHomePage(strapi, documentId, true))
    ) {
      throw new ValidationError(HOME_REQUIRED);
    }
    return next();
  }

  if (context.action === 'publish') {
    const documentId = context.params?.documentId;
    const draftIsHome = await documentIsHome(strapi, documentId, false);
    if (!draftIsHome && !(await hasOtherHomePage(strapi, documentId, true))) {
      throw new ValidationError(HOME_REQUIRED);
    }
    const saved = await next();
    if (draftIsHome) await clearOtherHomePages(strapi, documentId, true);
    return saved;
  }

  if (context.action === 'clone') {
    const created = await next();
    const documentId = created?.documentId;
    if (!documentId) return created;
    for (const published of [false, true]) {
      if (
        (await documentIsHome(strapi, documentId, published)) &&
        (await hasOtherHomePage(strapi, documentId, published))
      ) {
        await strapi.db.query(PAGE_UID).updateMany({
          where: { documentId, ...versionWhere(published) },
          data: { isHome: false },
        });
      }
    }
    return created;
  }

  if (context.action !== 'create' && context.action !== 'update') return next();

  const data = context.params?.data;
  const documentId = context.params?.documentId;
  const published = isPublishedWrite(context);
  const specified = Boolean(data) && Object.prototype.hasOwnProperty.call(data, 'isHome');
  const isHome = specified ? data.isHome === true : context.action === 'create' ? false : undefined;

  if (isHome === false && !(await hasOtherHomePage(strapi, documentId, published))) {
    throw new ValidationError(HOME_REQUIRED);
  }

  const saved = await next();
  const savedId = saved?.documentId ?? documentId;
  if (isHome === true && savedId) await clearOtherHomePages(strapi, savedId, published);
  return saved;
}

module.exports = { PAGE_UID, enforceSingleHomePage };
