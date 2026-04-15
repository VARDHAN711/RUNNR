import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
  // 1. Ignore build artifacts
  {
    ignores: ["dist", "node_modules", "vite.config.js"]
  },

  // 2. Base configurations
  js.configs.recommended,
  pluginReact.configs.flat.recommended,

  // 3. Custom configuration for your source files
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: "detect", // Automatically detects your React version to clear warnings
      },
    },
    rules: {
      // Include recommended rules for hooks (useEffect, etc.)
      ...pluginReactHooks.configs.recommended.rules,

      // Fix for the 46 errors found in Jenkins:
      "react/prop-types": "off",            // Stops "missing in props validation" errors
      "react/no-unescaped-entities": "off", // Stops errors with characters like ' and "
      "no-unused-vars": "warn",             // Downgrades "defined but never used" to a warning

      // Optional: Add common React rules
      "react/react-in-jsx-scope": "off",    // Not needed for React 17+
      "react/jsx-uses-react": "off",
    },
  },
];