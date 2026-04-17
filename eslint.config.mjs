import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // React 19 added `react-hooks/set-state-in-effect` which fires on the
      // standard Next.js pattern of `useEffect(() => { load(); }, [load])` for
      // client-only data fetches and `useEffect(() => setState(localStorage.X))`
      // for SSR-safe client-value hydration. These patterns are safe and
      // intentional; downgrade to warning so they don't block CI/build.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
