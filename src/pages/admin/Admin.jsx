import { useEffect, useMemo, useState } from "react";
import "./admin.css";
import { resolveAbout } from "../../data/about.js";

const API = "/api/admin";

const clone = (value) => JSON.parse(JSON.stringify(value));
const money = (site, price) => `${site?.currency || "$"}${price}`;
const dateLabel = (value) => new Date(value).toLocaleString();
const splitLines = (value) => value.split(/\r?\n/);
const joinLines = (value) => (value || []).join("\n");
const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const nextProductId = (products, categoryId) => {
  const prefix = `${categoryId}-`;
  const max = products
    .filter((p) => p.id.startsWith(prefix))
    .reduce((highest, p) => Math.max(highest, Number(p.id.slice(prefix.length)) || 0), 0);
  return `${prefix}${max + 1}`;
};

const nextMerchId = (merch) => {
  const max = merch.reduce((highest, item) => {
    const number = Number(item.id.replace(/^m-/, "")) || 0;
    return Math.max(highest, number);
  }, 0);
  return `m-${max + 1}`;
};

const tabs = [
  ["overview", "Overview"],
  ["products", "Products"],
  ["categories", "Categories"],
  ["merch", "Merch"],
  ["about", "About page"],
  ["settings", "Settings"],
  ["history", "History"],
];

export default function Admin() {
  const [catalog, setCatalog] = useState(null);
  const [history, setHistory] = useState([]);
  const [images, setImages] = useState([]);
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modal, setModal] = useState(null);

  const load = async () => {
    setError("");
    try {
      const response = await fetch(`${API}/data`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      setCatalog(data.catalog);
      setHistory(data.history || []);
      setImages(data.images || []);
      setDirty(false);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load admin data. Start the site with npm run dev."
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (updater) => {
    setCatalog((current) => updater(clone(current)));
    setDirty(true);
    setStatus("");
  };

  const save = async () => {
    if (!catalog) return;
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch(`${API}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalog, summary: summary || "Catalog update" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");
      setHistory(data.history || []);
      setImages(data.images || []);
      setDirty(false);
      setSummary("");
      setStatus("Saved. The storefront data is updated.");
    } catch (saveError) {
      setStatus(`Save failed: ${saveError instanceof Error ? saveError.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const restore = async (entry) => {
    if (!entry?.catalog) return;
    if (!window.confirm(`Restore the snapshot from ${dateLabel(entry.at)}?`)) return;
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch(`${API}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catalog: entry.catalog,
          summary: `Restored: ${entry.summary}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Restore failed");
      setCatalog(data.catalog);
      setHistory(data.history || []);
      setImages(data.images || []);
      setDirty(false);
      setTab("overview");
      setStatus(`Restored: ${entry.summary}`);
    } catch (restoreError) {
      setStatus(`Restore failed: ${restoreError instanceof Error ? restoreError.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const openNewProduct = () => {
    const category = catalog.categories[0];
    if (!category) return;
    setModal({
      type: "product",
      mode: "new",
      item: {
        id: nextProductId(catalog.products, category.id),
        categoryId: category.id,
        name: "",
        price: category.price || 0,
        kind: "product",
        description: "",
        image: category.banner || "",
      },
    });
  };

  const openNewMerch = () => {
    setModal({
      type: "merch",
      mode: "new",
      item: {
        id: nextMerchId(catalog.merch),
        kind: "merch",
        name: "",
        price: 0,
        description: "",
        image: "/images/categories/merch-card.jpg",
      },
    });
  };

  const openNewCategory = () => {
    const max = catalog.categories.reduce((highest, category) => Math.max(highest, Number(category.id) || 0), 0);
    const id = max + 1;
    setModal({
      type: "category",
      mode: "new",
      item: {
        id,
        slug: `category-${id}`,
        name: "",
        blurb: "",
        seoDescription: "",
        introTitle: "",
        intro: "",
        faqTitle: "",
        faq: [],
        banner: "",
        cardImage: "",
        price: 0,
      },
    });
  };

  const saveProduct = (product) => {
    update((current) => {
      if (modal.type === "merch") {
        return {
          ...current,
          merch:
            modal.mode === "new"
              ? [...current.merch, product]
              : current.merch.map((item) => (item.id === modal.item.id ? product : item)),
        };
      }
      return {
        ...current,
        products:
          modal.mode === "new"
            ? [...current.products, product]
            : current.products.map((item) => (item.id === modal.item.id ? product : item)),
      };
    });
    setModal(null);
  };

  const saveCategory = (category) => {
    const originalId = modal.mode === "edit" ? Number(modal.item.id) : null;
    const originalSlug = modal.mode === "edit" ? modal.item.slug : null;
    const duplicateId = catalog.categories.some(
      (item) => Number(item.id) === Number(category.id) && Number(item.id) !== originalId
    );
    const duplicateSlug = catalog.categories.some(
      (item) => item.slug === category.slug && item.slug !== originalSlug
    );
    if (duplicateId) {
      window.alert("That category ID is already in use.");
      return;
    }
    if (duplicateSlug) {
      window.alert("That category slug is already in use.");
      return;
    }

    update((current) => {
      const categories =
        modal.mode === "new"
          ? [...current.categories, category]
          : current.categories.map((item) => (item.id === modal.item.id ? category : item));
      const products =
        modal.mode === "edit" && Number(modal.item.id) !== Number(category.id)
          ? current.products.map((product) =>
              product.categoryId === modal.item.id ? { ...product, categoryId: category.id } : product
            )
          : current.products;
      return { ...current, categories, products };
    });
    setModal(null);
  };

  const removeProduct = (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    update((current) => ({
      ...current,
      products: current.products.filter((item) => item.id !== product.id),
    }));
  };

  const removeMerch = (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    update((current) => ({
      ...current,
      merch: current.merch.filter((product) => product.id !== item.id),
    }));
  };

  const removeCategory = (category) => {
    const count = catalog.products.filter((product) => product.categoryId === category.id).length;
    if (count > 0) {
      window.alert(`This category has ${count} product${count === 1 ? "" : "s"}. Move or delete them first.`);
      return;
    }
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    update((current) => ({
      ...current,
      categories: current.categories.filter((item) => item.id !== category.id),
    }));
  };

  const filteredProducts = useMemo(() => {
    if (!catalog) return [];
    const search = query.toLowerCase().trim();
    return catalog.products.filter((product) => {
      const matchesSearch = !search || product.name.toLowerCase().includes(search);
      const matchesCategory = categoryFilter === "all" || product.categoryId === Number(categoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [catalog, query, categoryFilter]);

  const filteredMerch = useMemo(() => {
    if (!catalog) return [];
    const search = query.toLowerCase().trim();
    return catalog.merch.filter((item) => !search || item.name.toLowerCase().includes(search));
  }, [catalog, query]);

  if (error) {
    return (
      <div className="admin admin-centered">
        <div className="admin-error">
          <h1>Admin unavailable</h1>
          <p>{error}</p>
          <p className="admin-muted">The local admin runs only with `npm run dev`.</p>
          <button className="admin-button" type="button" onClick={load}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="admin admin-centered">
        <p className="admin-muted">Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-brand">IRON ASCENSION</p>
          <p className="admin-subtitle">Local admin</p>
        </div>
        <nav className="admin-nav">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "active" : ""}
              onClick={() => {
                setTab(id);
                setQuery("");
                setCategoryFilter("all");
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" rel="noreferrer">
            Open storefront
          </a>
          <span>Changes save to `src/data/catalog.json`.</span>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>{tabs.find(([id]) => id === tab)?.[1]}</h1>
            <p className="admin-muted">
              {dirty ? "Unsaved changes" : "All changes saved"} · {status || "Edit the local catalog"}
            </p>
          </div>
          <div className="admin-savebar">
            <input
              className="admin-input"
              placeholder="Change note (optional)"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
            <button className="admin-button" type="button" onClick={save} disabled={saving || !dirty}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </header>

        <main className="admin-content">
          {tab === "overview" && (
            <OverviewPanel catalog={catalog} history={history} images={images} setTab={setTab} />
          )}

          {tab === "products" && (
            <ProductPanel
              title="Products"
              items={filteredProducts}
              site={catalog.site}
              categories={catalog.categories}
              query={query}
              setQuery={setQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onAdd={openNewProduct}
              onEdit={(item) => setModal({ type: "product", mode: "edit", item })}
              onDelete={removeProduct}
            />
          )}

          {tab === "merch" && (
            <ProductPanel
              title="Merch"
              items={filteredMerch}
              site={catalog.site}
              categories={[]}
              query={query}
              setQuery={setQuery}
              onAdd={openNewMerch}
              onEdit={(item) => setModal({ type: "merch", mode: "edit", item })}
              onDelete={removeMerch}
            />
          )}

          {tab === "categories" && (
            <CategoryPanel
              catalog={catalog}
              onAdd={openNewCategory}
              onEdit={(item) => setModal({ type: "category", mode: "edit", item })}
              onDelete={removeCategory}
            />
          )}

          {tab === "settings" && (
            <SettingsPanel catalog={catalog} update={update} images={images} setImages={setImages} />
          )}

          {tab === "about" && (
            <AboutPanel catalog={catalog} update={update} images={images} setImages={setImages} />
          )}

          {tab === "history" && <HistoryPanel history={history} onRestore={restore} />}
        </main>
      </div>

      {modal && modal.type === "category" && (
        <Modal title={modal.mode === "new" ? "Add category" : "Edit category"} onClose={() => setModal(null)}>
          <CategoryForm
            mode={modal.mode}
            category={modal.item}
            images={images}
            setImages={setImages}
            onSave={saveCategory}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {modal && (modal.type === "product" || modal.type === "merch") && (
        <Modal title={modal.mode === "new" ? "Add product" : "Edit product"} onClose={() => setModal(null)}>
          <ProductForm
            mode={modal.mode}
            kind={modal.type}
            product={modal.item}
            categories={catalog.categories}
            products={catalog.products}
            merch={catalog.merch}
            images={images}
            setImages={setImages}
            onSave={saveProduct}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function OverviewPanel({ catalog, history, images, setTab }) {
  const lastSave = history[0];
  return (
    <div className="admin-stack">
      <section className="admin-stats">
        <Stat label="Categories" value={catalog.categories.length} />
        <Stat label="Products" value={catalog.products.length} />
        <Stat label="Merch" value={catalog.merch.length} />
        <Stat label="Images" value={images.length} />
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <h2>Catalog breakdown</h2>
            <p className="admin-muted">Products currently assigned to each category.</p>
          </div>
          <button className="admin-button admin-button-ghost" type="button" onClick={() => setTab("products")}>
            Manage products
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Base price</th>
              </tr>
            </thead>
            <tbody>
              {catalog.categories.map((category) => {
                const count = catalog.products.filter((product) => product.categoryId === category.id).length;
                return (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td className="admin-muted">/{category.slug}</td>
                    <td>{count}</td>
                    <td>{money(catalog.site, category.price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <h2>Last saved</h2>
            <p className="admin-muted">
              {lastSave ? `${lastSave.summary} · ${dateLabel(lastSave.at)}` : "No saved changes yet."}
            </p>
          </div>
          <button className="admin-button admin-button-ghost" type="button" onClick={() => setTab("history")}>
            View history
          </button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="admin-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProductPanel({
  title,
  items,
  site,
  categories,
  query,
  setQuery,
  categoryFilter,
  setCategoryFilter,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>{title}</h2>
          <p className="admin-muted">{items.length} shown</p>
        </div>
        <button className="admin-button" type="button" onClick={onAdd} disabled={title !== "Merch" && categories.length === 0}>
          Add {title === "Merch" ? "merch" : "product"}
        </button>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          placeholder="Search by name..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {categories.length > 0 && (
          <select
            className="admin-input"
            value={categoryFilter || "all"}
            onChange={(event) => setCategoryFilter?.(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              {categories.length > 0 && <th>Category</th>}
              <th>Price</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const category = categories.find((entry) => entry.id === item.categoryId);
              return (
                <tr key={item.id}>
                  <td>
                    {item.image ? (
                      <img className="admin-thumb" src={item.image} alt="" />
                    ) : (
                      <span className="admin-thumb admin-thumb-empty" />
                    )}
                  </td>
                  <td>
                    <strong>{item.name || "Untitled"}</strong>
                    <span className="admin-id">{item.id}</span>
                  </td>
                  {categories.length > 0 && <td>{category?.name || "Unassigned"}</td>}
                  <td>{money(site, item.price)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-link" type="button" onClick={() => onEdit(item)}>
                        Edit
                      </button>
                      <button className="admin-link admin-link-danger" type="button" onClick={() => onDelete(item)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={categories.length > 0 ? 5 : 4} className="admin-empty">
                  No items match this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CategoryPanel({ catalog, onAdd, onEdit, onDelete }) {
  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>Categories</h2>
          <p className="admin-muted">{catalog.categories.length} categories</p>
        </div>
        <button className="admin-button" type="button" onClick={onAdd}>
          Add category
        </button>
      </div>

      <div className="admin-category-grid">
        {catalog.categories.map((category) => {
          const count = catalog.products.filter((product) => product.categoryId === category.id).length;
          return (
            <article key={category.id} className="admin-category">
              <div className="admin-category-image">
                {category.cardImage || category.banner ? (
                  <img src={category.cardImage || category.banner} alt="" />
                ) : (
                  <span className="admin-thumb-empty" />
                )}
              </div>
              <div className="admin-category-body">
                <span className="admin-id">{category.slug}</span>
                <h3>{category.name || "Untitled"}</h3>
                <p className="admin-muted">{count} products</p>
                <p className="admin-muted">{category.blurb}</p>
                <div className="admin-row-actions">
                  <button className="admin-link" type="button" onClick={() => onEdit(category)}>
                    Edit
                  </button>
                  <button className="admin-link admin-link-danger" type="button" onClick={() => onDelete(category)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SettingsPanel({ catalog, update, images, setImages }) {
  const setSite = (key, value) => update((current) => ({ ...current, site: { ...current.site, [key]: value } }));
  const setImage = (key, value) => update((current) => ({ ...current, images: { ...current.images, [key]: value } }));
  const setDiscount = (key, value) =>
    update((current) => ({ ...current, discounts: { ...current.discounts, [key]: value } }));

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2>Store details</h2>
        <div className="admin-form-grid">
          <TextField label="Brand name" value={catalog.site.name} onChange={(value) => setSite("name", value)} />
          <TextField label="Tagline" value={catalog.site.tagline} onChange={(value) => setSite("tagline", value)} />
          <TextField label="Email" value={catalog.site.email} onChange={(value) => setSite("email", value)} />
          <TextField label="Phone" value={catalog.site.phone} onChange={(value) => setSite("phone", value)} />
          <TextField
            label="WhatsApp number"
            value={catalog.site.whatsappNumber}
            onChange={(value) => setSite("whatsappNumber", value)}
          />
          <TextField
            label="Telegram username"
            value={catalog.site.telegram}
            onChange={(value) => setSite("telegram", value)}
          />
          <TextField label="Hours" value={catalog.site.hours} onChange={(value) => setSite("hours", value)} />
          <TextField label="Currency" value={catalog.site.currency} onChange={(value) => setSite("currency", value)} />
          <TextField label="Merch label" value={catalog.site.merchLabel} onChange={(value) => setSite("merchLabel", value)} />
          <TextField
            label="Return window (days)"
            type="number"
            value={catalog.site.returnWindowDays}
            onChange={(value) => setSite("returnWindowDays", Number(value))}
          />
          <TextField
            label="Effective date"
            value={catalog.site.effectiveDate}
            onChange={(value) => setSite("effectiveDate", value)}
          />
        </div>
      </section>

      <section className="admin-card">
        <h2>Announcement bar</h2>
        <LinesField
          label="Messages (one per line)"
          value={catalog.announcements}
          onChange={(value) => update((current) => ({ ...current, announcements: value }))}
        />
      </section>

      <section className="admin-card">
        <h2>Age gate</h2>
        <div className="admin-form-grid">
          <label className="admin-check">
            <input
              type="checkbox"
              checked={Boolean(catalog.ageGate.enabled)}
              onChange={(event) =>
                update((current) => ({
                  ...current,
                  ageGate: { ...current.ageGate, enabled: event.target.checked },
                }))
              }
            />
            Enabled
          </label>
          <TextField
            label="Minimum age"
            type="number"
            value={catalog.ageGate.minAge}
            onChange={(value) =>
              update((current) => ({ ...current, ageGate: { ...current.ageGate, minAge: Number(value) } }))
            }
          />
          <TextField
            label="Message"
            value={catalog.ageGate.message}
            onChange={(value) =>
              update((current) => ({ ...current, ageGate: { ...current.ageGate, message: value } }))
            }
          />
        </div>
      </section>

      <section className="admin-card">
        <h2>Free gift</h2>
        <div className="admin-form-grid">
          <TextField
            label="Spend threshold"
            type="number"
            value={catalog.freeGift.threshold}
            onChange={(value) =>
              update((current) => ({ ...current, freeGift: { ...current.freeGift, threshold: Number(value) } }))
            }
          />
          <TextField
            label="Gift item"
            value={catalog.freeGift.item}
            onChange={(value) =>
              update((current) => ({ ...current, freeGift: { ...current.freeGift, item: value } }))
            }
          />
        </div>
      </section>

      <section className="admin-card">
        <h2>Discounts</h2>
        <div className="admin-form-grid">
          <TextField
            label="Welcome code"
            value={catalog.discounts.welcomeCode?.code}
            onChange={(value) =>
              setDiscount("welcomeCode", { ...catalog.discounts.welcomeCode, code: value })
            }
          />
          <TextField
            label="Welcome discount %"
            type="number"
            value={catalog.discounts.welcomeCode?.percent}
            onChange={(value) =>
              setDiscount("welcomeCode", { ...catalog.discounts.welcomeCode, percent: Number(value) })
            }
          />
          <TextField
            label="Bitcoin discount %"
            type="number"
            value={catalog.discounts.bitcoinPercent}
            onChange={(value) => setDiscount("bitcoinPercent", Number(value))}
          />
          <TextField
            label="Maximum combined %"
            type="number"
            value={catalog.discounts.maxCombinedPercent}
            onChange={(value) => setDiscount("maxCombinedPercent", Number(value))}
          />
        </div>
        <JsonField
          label="Volume tiers"
          value={catalog.discounts.volumeTiers}
          onChange={(value) => setDiscount("volumeTiers", value)}
        />
      </section>

      <section className="admin-card">
        <h2>Payment methods</h2>
        <LinesField
          label="One per line"
          value={catalog.paymentMethods}
          onChange={(value) => update((current) => ({ ...current, paymentMethods: value }))}
        />
      </section>

      <section className="admin-card">
        <h2>Site images</h2>
        <div className="admin-form-grid admin-form-grid-wide">
          {Object.entries(catalog.images).map(([key, value]) => (
            <ImageField
              key={key}
              label={key}
              value={value}
              images={images}
              setImages={setImages}
              onChange={(next) => setImage(key, next)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function AboutPanel({ catalog, update, images, setImages }) {
  const about = resolveAbout(catalog.about);
  const setAbout = (key, value) =>
    update((current) => ({
      ...current,
      about: { ...resolveAbout(current.about), [key]: value },
    }));
  const setImage = (key, value) =>
    update((current) => ({ ...current, images: { ...current.images, [key]: value } }));

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h2>Hero</h2>
        <p className="admin-muted">
          Use <code>{"{brand}"}</code> in any text field to insert the store name.
        </p>
        <div className="admin-form-grid">
          <TextField label="Eyebrow" value={about.heroEyebrow} onChange={(value) => setAbout("heroEyebrow", value)} />
          <TextField label="Title" value={about.heroTitle} onChange={(value) => setAbout("heroTitle", value)} />
          <TextAreaField label="Intro text" value={about.heroText} onChange={(value) => setAbout("heroText", value)} rows={3} />
        </div>
      </section>

      <section className="admin-card">
        <h2>Introduction</h2>
        <div className="admin-form-grid">
          <TextField label="Title" value={about.introTitle} onChange={(value) => setAbout("introTitle", value)} />
          <TextAreaField label="Body" value={about.introBody} onChange={(value) => setAbout("introBody", value)} rows={4} />
        </div>
      </section>

      <section className="admin-card">
        <h2>Catalog section</h2>
        <div className="admin-form-grid">
          <TextField label="Eyebrow" value={about.catalogEyebrow} onChange={(value) => setAbout("catalogEyebrow", value)} />
          <TextField label="Title" value={about.catalogTitle} onChange={(value) => setAbout("catalogTitle", value)} />
          <TextAreaField label="Intro text" value={about.catalogText} onChange={(value) => setAbout("catalogText", value)} rows={3} />
          <TextField label="Merch card title" value={about.merchTitle} onChange={(value) => setAbout("merchTitle", value)} />
          <TextAreaField label="Merch card text" value={about.merchText} onChange={(value) => setAbout("merchText", value)} rows={3} />
        </div>
        <p className="admin-muted">Category cards are generated from the Categories tab.</p>
      </section>

      <section className="admin-card">
        <h2>Order-request process</h2>
        <div className="admin-form-grid">
          <TextField label="Eyebrow" value={about.processEyebrow} onChange={(value) => setAbout("processEyebrow", value)} />
          <TextField label="Title" value={about.processTitle} onChange={(value) => setAbout("processTitle", value)} />
          <TextAreaField label="Intro text" value={about.processText} onChange={(value) => setAbout("processText", value)} rows={3} />
        </div>
        <AboutStepsField value={about.processSteps} onChange={(value) => setAbout("processSteps", value)} />
      </section>

      <section className="admin-card">
        <h2>Quality assurance</h2>
        <div className="admin-form-grid">
          <TextField label="Eyebrow" value={about.qualityEyebrow} onChange={(value) => setAbout("qualityEyebrow", value)} />
          <TextField label="Title" value={about.qualityTitle} onChange={(value) => setAbout("qualityTitle", value)} />
          <TextAreaField label="Body" value={about.qualityBody} onChange={(value) => setAbout("qualityBody", value)} rows={4} />
        </div>
      </section>

      <section className="admin-card">
        <h2>FAQ</h2>
        <div className="admin-form-grid">
          <TextField label="Eyebrow" value={about.faqEyebrow} onChange={(value) => setAbout("faqEyebrow", value)} />
          <TextField label="Title" value={about.faqTitle} onChange={(value) => setAbout("faqTitle", value)} />
        </div>
        <FaqField value={about.faqItems} onChange={(value) => setAbout("faqItems", value)} />
      </section>

      <section className="admin-card">
        <h2>Call to action</h2>
        <div className="admin-form-grid">
          <TextField label="Eyebrow" value={about.ctaEyebrow} onChange={(value) => setAbout("ctaEyebrow", value)} />
          <TextField label="Title" value={about.ctaTitle} onChange={(value) => setAbout("ctaTitle", value)} />
          <TextAreaField label="Text" value={about.ctaText} onChange={(value) => setAbout("ctaText", value)} rows={3} />
          <TextField label="Primary button" value={about.ctaPrimaryLabel} onChange={(value) => setAbout("ctaPrimaryLabel", value)} />
          <TextField label="Secondary button" value={about.ctaSecondaryLabel} onChange={(value) => setAbout("ctaSecondaryLabel", value)} />
        </div>
      </section>

      <section className="admin-card">
        <h2>Page images</h2>
        <div className="admin-form-grid admin-form-grid-wide">
          <ImageField
            label="Main editorial image"
            value={catalog.images.about}
            images={images}
            setImages={setImages}
            onChange={(value) => setImage("about", value)}
          />
          <ImageField
            label="Catalog lineup image"
            value={catalog.images.aboutLineup}
            images={images}
            setImages={setImages}
            onChange={(value) => setImage("aboutLineup", value)}
          />
          <ImageField
            label="Call-to-action background"
            value={catalog.images.aboutCta}
            images={images}
            setImages={setImages}
            onChange={(value) => setImage("aboutCta", value)}
          />
        </div>
      </section>
    </div>
  );
}

function AboutStepsField({ value, onChange }) {
  const steps = value || [];
  const patch = (index, key, next) =>
    onChange(steps.map((step, stepIndex) => (stepIndex === index ? { ...step, [key]: next } : step)));

  return (
    <div className="admin-field admin-field-full">
      <span>Steps</span>
      <div className="admin-repeater">
        {steps.map((step, index) => (
          <div className="admin-repeater-item" key={index}>
            <div className="admin-repeater-head">
              <strong>Step {index + 1}</strong>
              <button
                className="admin-link admin-link-danger"
                type="button"
                onClick={() => onChange(steps.filter((_, stepIndex) => stepIndex !== index))}
              >
                Remove
              </button>
            </div>
            <div className="admin-form-grid admin-form-grid-wide">
              <TextField label="Title" value={step.title} onChange={(next) => patch(index, "title", next)} />
              <TextAreaField label="Text" value={step.text} onChange={(next) => patch(index, "text", next)} rows={3} />
            </div>
          </div>
        ))}
        <button
          className="admin-button admin-button-ghost"
          type="button"
          onClick={() => onChange([...steps, { title: "", text: "" }])}
        >
          Add step
        </button>
      </div>
    </div>
  );
}

function FaqField({ value, onChange }) {
  const items = value || [];
  const patch = (index, key, next) =>
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: next } : item)));

  return (
    <div className="admin-field admin-field-full">
      <span>Questions</span>
      <div className="admin-repeater">
        {items.map((item, index) => (
          <div className="admin-repeater-item" key={index}>
            <div className="admin-repeater-head">
              <strong>Question {index + 1}</strong>
              <button
                className="admin-link admin-link-danger"
                type="button"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </button>
            </div>
            <TextAreaField label="Question" value={item.q} onChange={(next) => patch(index, "q", next)} rows={2} />
            <TextAreaField label="Answer" value={item.a} onChange={(next) => patch(index, "a", next)} rows={3} />
          </div>
        ))}
        <button
          className="admin-button admin-button-ghost"
          type="button"
          onClick={() => onChange([...items, { q: "", a: "" }])}
        >
          Add question
        </button>
      </div>
    </div>
  );
}

function HistoryPanel({ history, onRestore }) {
  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>Edit history</h2>
          <p className="admin-muted">The latest 40 saves are kept with a full catalog snapshot.</p>
        </div>
      </div>
      {history.length === 0 ? (
        <p className="admin-empty">No saves yet. Edit the catalog and save to create the first snapshot.</p>
      ) : (
        <div className="admin-history">
          {history.map((entry) => (
            <article key={entry.id} className="admin-history-item">
              <div>
                <strong>{entry.summary}</strong>
                <p className="admin-muted">
                  {dateLabel(entry.at)} · {entry.catalog?.products?.length ?? 0} products ·{" "}
                  {entry.catalog?.merch?.length ?? 0} merch
                </p>
              </div>
              <button className="admin-button admin-button-ghost" type="button" onClick={() => onRestore(entry)}>
                Restore
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ProductForm({
  mode,
  kind,
  product,
  categories,
  products,
  merch,
  images,
  setImages,
  onSave,
  onCancel,
}) {
  const [draft, setDraft] = useState(() => clone(product));
  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const next = {
      ...draft,
      name: draft.name.trim(),
      price: Number(draft.price) || 0,
      description: draft.description || "",
    };
    if (!next.name) {
      window.alert("Product name is required.");
      return;
    }
    if (kind === "merch") {
      next.kind = "merch";
      next.id = mode === "new" ? nextMerchId(merch) : draft.id;
    } else {
      next.kind = "product";
      next.categoryId = Number(draft.categoryId);
      next.id = mode === "new" ? nextProductId(products, next.categoryId) : draft.id;
    }
    onSave(next);
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="admin-form-grid">
        {kind === "product" && (
          <label className="admin-field">
            <span>Category</span>
            <select
              className="admin-input"
              value={draft.categoryId}
              onChange={(event) => set("categoryId", Number(event.target.value))}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <TextField label="Name" value={draft.name} onChange={(value) => set("name", value)} />
        <TextField label="Price" type="number" value={draft.price} onChange={(value) => set("price", value)} />
        <TextField label="Product ID" value={mode === "new" ? "Generated on save" : draft.id} onChange={() => {}} disabled />
      </div>
      <ImageField
        label="Product image"
        value={draft.image}
        images={images}
        setImages={setImages}
        onChange={(value) => set("image", value)}
      />
      <label className="admin-field">
        <span>Description</span>
        <textarea
          className="admin-input admin-textarea"
          rows={4}
          value={draft.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </label>
      <div className="admin-form-actions">
        <button className="admin-button admin-button-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="admin-button" type="submit">
          Save {kind === "merch" ? "merch" : "product"}
        </button>
      </div>
    </form>
  );
}

function CategoryForm({ mode, category, images, setImages, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => clone(category));
  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const name = draft.name.trim();
    const id = Number(draft.id) || 0;
    if (!name) {
      window.alert("Category name is required.");
      return;
    }
    if (!Number.isInteger(id) || id <= 0) {
      window.alert("Category ID must be a positive whole number.");
      return;
    }
    onSave({
      ...draft,
      id,
      slug: slugify(draft.slug || name) || `category-${id}`,
      name,
      price: Number(draft.price) || 0,
    });
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <div className="admin-form-grid">
        <TextField label="Name" value={draft.name} onChange={(value) => set("name", value)} />
        <TextField label="Slug" value={draft.slug} onChange={(value) => set("slug", value)} />
        <TextField label="Category ID" type="number" value={draft.id} onChange={(value) => set("id", value)} />
        <TextField label="Base price" type="number" value={draft.price} onChange={(value) => set("price", value)} />
        <TextField label="Blurb" value={draft.blurb} onChange={(value) => set("blurb", value)} />
        <TextField label="Intro title" value={draft.introTitle} onChange={(value) => set("introTitle", value)} />
        <TextAreaField
          label="SEO description (max 160 characters)"
          value={draft.seoDescription}
          onChange={(value) => set("seoDescription", value)}
          rows={2}
        />
        <TextAreaField
          label="Category introduction"
          value={draft.intro}
          onChange={(value) => set("intro", value)}
          rows={6}
        />
        <TextField label="FAQ title" value={draft.faqTitle} onChange={(value) => set("faqTitle", value)} />
      </div>
      <FaqField value={draft.faq} onChange={(value) => set("faq", value)} />
      <ImageField
        label="Card image"
        value={draft.cardImage}
        images={images}
        setImages={setImages}
        onChange={(value) => set("cardImage", value)}
      />
      <ImageField
        label="Category page banner"
        value={draft.banner}
        images={images}
        setImages={setImages}
        onChange={(value) => set("banner", value)}
      />
      <div className="admin-form-actions">
        <button className="admin-button admin-button-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="admin-button" type="submit">
          Save category
        </button>
      </div>
    </form>
  );
}

function TextField({ label, value, onChange, type = "text", disabled = false }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        className="admin-input"
        type={type}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, rows = 4 }) {
  return (
    <label className="admin-field admin-field-full">
      <span>{label}</span>
      <textarea
        className="admin-input admin-textarea"
        rows={rows}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function LinesField({ label, value, onChange }) {
  const [text, setText] = useState(joinLines(value));
  return (
    <label className="admin-field">
      <span>{label}</span>
      <textarea
        className="admin-input admin-textarea"
        rows={4}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChange(splitLines(event.target.value));
        }}
      />
    </label>
  );
}

function JsonField({ label, value, onChange }) {
  const serialized = JSON.stringify(value, null, 2);
  const [text, setText] = useState(serialized);
  const [error, setError] = useState("");

  useEffect(() => {
    setText(serialized);
    setError("");
  }, [serialized]);

  const change = (next) => {
    setText(next);
    try {
      onChange(JSON.parse(next));
      setError("");
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <label className="admin-field">
      <span>{label}</span>
      <textarea
        className="admin-input admin-textarea admin-code"
        rows={8}
        value={text}
        onChange={(event) => change(event.target.value)}
      />
      {error && <em className="admin-error-text">{error}</em>}
    </label>
  );
}

function ImageField({ label, value, images, setImages, onChange }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const response = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, dataUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setImages(data.images || []);
      onChange(data.url);
    } catch (uploadError) {
      window.alert(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-field admin-image-field">
      <span>{label}</span>
      <div className="admin-image-row">
        {value ? (
          <img className="admin-image-preview" src={value} alt="" />
        ) : (
          <span className="admin-image-preview admin-thumb-empty" />
        )}
        <div className="admin-image-controls">
          <input
            className="admin-input"
            value={value || ""}
            placeholder="/images/..."
            onChange={(event) => onChange(event.target.value)}
          />
          <select className="admin-input" value="" onChange={(event) => event.target.value && onChange(event.target.value)}>
            <option value="">Pick an existing image...</option>
            {images.map((image) => (
              <option key={image} value={image}>
                {image}
              </option>
            ))}
          </select>
          <label className="admin-button admin-button-ghost admin-upload">
            {uploading ? "Uploading..." : "Upload image"}
            <input type="file" accept="image/*" onChange={upload} hidden />
          </label>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="admin-modal-head">
          <h2>{title}</h2>
          <button className="admin-link" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
