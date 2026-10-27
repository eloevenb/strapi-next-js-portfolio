'use strict';

/**
 * app-bar service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::app-bar.app-bar');
