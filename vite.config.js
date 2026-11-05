import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import localAdmin from "./vite-plugin-local-admin.js";

export default defineConfig({ plugins: [react(), localAdmin()] });
