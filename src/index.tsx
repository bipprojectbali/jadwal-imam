import { cors } from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";
import Swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import type { User } from "generated/prisma";
import packageJson from "./../package.json";
import html from "./index.html";
import { prisma } from "./server/lib/prisma";
import { apiAuth } from "./server/middlewares/apiAuth";
import ApiKeyRoute from "./server/routes/apikey_route";
import Auth from "./server/routes/auth_route";
import Configs from "./server/routes/configs_route";
import JadwalShalat from "./server/routes/jadwal_shalat";
import { JadwalShalatAdmin } from "./server/routes/jadwal_shalat_admin";
const PORT = process.env.PORT || 3000;
const Docs = new Elysia().use(
  Swagger({
    path: "/docs",
    specPath: "/spec",
    exclude: ["/docs", "/spec"],
    documentation: {
      info: {
        title: packageJson.name,
        version: packageJson.version,
        description: "API documentation for " + packageJson.name,
        contact: {
          name: "Malik Kurosaki",
          email: "kurosakiblackangel@gmail.com",
          url: "https://github.com/malikkurosaki",
        },
        license: {
          name: "MIT",
          url:
            "https://github.com/malikkurosaki/" +
            packageJson.name +
            "/blob/main/LICENSE",
        },
      },
      servers: [
        {
          url: process.env.BASE_URL || "http://localhost:3000",
          description: process.env.BASE_URL
            ? "Production server"
            : "Local development server",
        },
      ],
    },
  }),
);

const ApiUser = new Elysia({
  prefix: "/user",
}).get(
  "/find",
  (ctx) => {
    const { user } = ctx as any;
    return {
      user: user as User,
    };
  },
  {
    detail: {
      description: "Get the current user information",
      summary: "Retrieve authenticated user details",
      tags: ["User"],
    },
  },
);

const Api = new Elysia({
  prefix: "/api",
})
  .use(JadwalShalat)
  .use(Configs)
  .use(apiAuth)
  .use(ApiKeyRoute)
  .use(ApiUser)
  .use(JadwalShalatAdmin);

const app = new Elysia()
  .use(cors())
  .use(staticPlugin())
  .use(Api)
  .use(Docs)
  .use(Auth)
  .get(
    "/get-allow-register",
    async () => {
      const configs = await prisma.configs.findUnique({ where: { id: "1" } });
      return { allowRegister: configs?.allowRegister };
    },
    {
      detail: {
        description: "Get allow register",
        summary: "get allow register",
      },
    },
  )
  .get(
    "/assets/:name",
    (ctx) => {
      try {
        const file = Bun.file(`public/${encodeURIComponent(ctx.params.name)}`);
        return new Response(file);
      } catch (error) {
        return new Response("File not found", { status: 404 });
      }
    },
    {
      detail: {
        description: "Serve static asset files",
        summary: "Get a static asset by name",
        tags: ["Static Assets"],
      },
    },
  )
  // .get(
  //   "/",
  //   async () => {
  //     const stream = await renderToReadableStream(<LandingPage />);
  //     return new Response(stream, {
  //       headers: { "Content-Type": "text/html" },
  //     });
  //   },
  //   {
  //     detail: {
  //       description: "Landing page for " + packageJson.name,
  //       summary: "Get the main landing page",
  //       tags: ["General"],
  //     },
  //   },
  // )
  .get("*", html)
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

export type ServerApp = typeof app;
