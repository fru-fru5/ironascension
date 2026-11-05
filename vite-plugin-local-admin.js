import fs from "node:fs";
import path from "node:path";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"]);

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function sendJson(res, status, value) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(value));
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Request too large"));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function isLocal(req) {
  const address = req.socket.remoteAddress || "";
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

function listImages(dir, prefix = "/images") {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const walk = (current, urlPrefix) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full, `${urlPrefix}/${entry.name}`);
      } else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
        out.push(`${urlPrefix}/${entry.name}`);
      }
    }
  };
  walk(dir, prefix);
  return out.sort((a, b) => a.localeCompare(b));
}

function safeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function localAdmin() {
  return {
    name: "local-admin",
    apply: "serve",
    configureServer(server) {
      const root = server.config.root;
      const dataDir = path.join(root, "src", "data");
      const catalogFile = path.join(dataDir, "catalog.json");
      const historyFile = path.join(dataDir, "admin-history.json");
      const imagesDir = path.join(root, "public", "images");

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/admin/")) return next();
        if (!isLocal(req)) return sendJson(res, 403, { error: "Local access only" });

        const url = new URL(req.url, "http://localhost");

        try {
          if (req.method === "GET" && url.pathname === "/api/admin/data") {
            const catalog = readJson(catalogFile, null);
            if (!catalog) return sendJson(res, 500, { error: "Catalog file missing" });
            return sendJson(res, 200, {
              catalog,
              history: readJson(historyFile, []),
              images: listImages(imagesDir),
            });
          }

          if (req.method === "PUT" && url.pathname === "/api/admin/data") {
            const body = JSON.parse(await readBody(req, 10 * 1024 * 1024));
            const catalog = body.catalog;

            if (
              !catalog ||
              !Array.isArray(catalog.categories) ||
              !Array.isArray(catalog.products) ||
              !Array.isArray(catalog.merch)
            ) {
              return sendJson(res, 400, { error: "Invalid catalog data" });
            }

            const ids = new Set();
            for (const item of [...catalog.products, ...catalog.merch]) {
              if (!item || typeof item.id !== "string" || !item.name || typeof item.price !== "number") {
                return sendJson(res, 400, { error: "Every product needs an id, name and numeric price" });
              }
              if (ids.has(item.id)) {
                return sendJson(res, 400, { error: `Duplicate product id: ${item.id}` });
              }
              ids.add(item.id);
            }

            writeJson(catalogFile, catalog);

            const history = readJson(historyFile, []);
            const entry = {
              id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              at: new Date().toISOString(),
              summary:
                typeof body.summary === "string" && body.summary.trim()
                  ? body.summary.trim().slice(0, 200)
                  : "Catalog update",
              catalog,
            };
            const nextHistory = [entry, ...history].slice(0, 40);
            writeJson(historyFile, nextHistory);

            return sendJson(res, 200, {
              ok: true,
              catalog,
              history: nextHistory,
              images: listImages(imagesDir),
            });
          }

          if (req.method === "POST" && url.pathname === "/api/admin/upload") {
            const body = JSON.parse(await readBody(req, 20 * 1024 * 1024));
            const dataUrl = String(body.dataUrl || "");
            const match = /^data:image\/(png|jpe?g|webp|gif|svg\+xml|avif);base64,(.+)$/i.exec(dataUrl);

            if (!match) return sendJson(res, 400, { error: "Unsupported image" });

            const extMap = {
              png: ".png",
              jpg: ".jpg",
              jpeg: ".jpg",
              webp: ".webp",
              gif: ".gif",
              "svg+xml": ".svg",
              avif: ".avif",
            };
            const ext = extMap[match[1].toLowerCase()] || ".png";
            const stem = safeName(body.filename) || `upload-${Date.now()}`;
            const dir = path.join(imagesDir, "uploads");
            fs.mkdirSync(dir, { recursive: true });

            let filename = `${stem}${ext}`;
            let n = 1;
            while (fs.existsSync(path.join(dir, filename))) {
              filename = `${stem}-${n++}${ext}`;
            }

            fs.writeFileSync(path.join(dir, filename), Buffer.from(match[2], "base64"));

            return sendJson(res, 200, {
              url: `/images/uploads/${filename}`,
              images: listImages(imagesDir),
            });
          }

          return sendJson(res, 404, { error: "Not found" });
        } catch (error) {
          return sendJson(res, 500, {
            error: error instanceof Error ? error.message : "Admin request failed",
          });
        }
      });
    },
  };
}
