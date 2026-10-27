module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://strapi.eloevenb.fr'),
  proxy: {
    koa: env.bool('IS_PROXIED', true),
  },
  app: {
    keys: env.array('APP_KEYS'),
    proxyIpHeader: 'X-Forwarded-For',
    maxIpsCount: 1,
  },
});
