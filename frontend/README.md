# Portfolio frontend

This is a Next.JS + React frontend that reads portfolio projects from the Strapi
API.

## Development

The repository's development Compose setup supplies the API URL through
`frontend/.env.dev`.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Only variables prefixed with `NEXT_` are exposed to browser code:

- `NEXT_STRAPI_API_URL` - Strapi API base URL, including `/api`
- `NEXT_STRAPI_READ_ONLY_TOKEN` - optional Strapi API token

## Scripts

- `npm run dev` - start the Vite development server
- `npm run build` - typecheck and build for production
- `npm run preview` - preview the production build
- `npm run lint` - run the TypeScript check
