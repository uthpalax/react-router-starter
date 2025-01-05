import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout('routes/auth/layout.tsx', [
    route("login", "routes/auth/login.tsx")
  ])
] satisfies RouteConfig;
