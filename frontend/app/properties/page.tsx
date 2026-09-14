"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiUrl } from "../api";
import styles from "./page.module.css";

type Property = {
  id: number;
  slug: string;
  title: string;
  listing_type: "sale" | "rent";
  price: string;
  currency: string;
  bedrooms: number;
  bathrooms: string;
  area_sqft: number | null;
  city: string;
  state: string | null;
  images?: { url: string }[];
};

const fallbackImage =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=85";

function price(property: Property) {
  return (
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: property.currency,
      maximumFractionDigits: 0,
    }).format(Number(property.price)) +
    (property.listing_type === "rent" ? " / mo" : "")
  );
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filter, setFilter] = useState<"all" | "sale" | "rent">("all");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadingRequest = window.setTimeout(() => setLoading(true), 0);
    const query = new URLSearchParams({ per_page: "24" });
    if (filter !== "all") query.set("listing_type", filter);
    if (city.trim()) query.set("city", city.trim());
    fetch(`${apiUrl}/properties?${query}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Homes could not be loaded.");
        return response.json();
      })
      .then((data) => setProperties(data.data ?? []))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setLoading(false));
    return () => {
      window.clearTimeout(loadingRequest);
      controller.abort();
    };
  }, [filter, city]);

  return (
    <main className={styles.page}>
      <header className={`${styles.header} container-xl`}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>N</span>
          <span>
            northstar<span className={styles.dot}>.</span>
          </span>
        </Link>
        <Link className={styles.backLink} href="/">
          Back to home <span>↙</span>
        </Link>
      </header>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>The collection</p>
        <h1>
          Every home has
          <br />
          <em>a point of view.</em>
        </h1>
        <p>
          Browse the complete Northstar collection, carefully selected for how
          it feels to live there.
        </p>
      </section>
      <section
        className={`${styles.controls} container-xl`}
        aria-label="Property filters"
      >
        <div className={`${styles.tabs} nav nav-pills`}>
          {[
            ["all", "All homes"],
            ["sale", "For sale"],
            ["rent", "For rent"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={`nav-link ${filter === value ? `${styles.activeTab} active` : ""}`}
              onClick={() => setFilter(value as "all" | "sale" | "rent")}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          aria-label="Filter by city"
          placeholder="Search a city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
      </section>
      {loading && <p className={styles.message}>Finding available homes...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && properties.length === 0 && (
        <p className={styles.message}>No homes match this search yet.</p>
      )}
      <section className={styles.grid}>
        {properties.map((property) => (
          <Link
            className={`${styles.card} col-12 col-md-6 col-xl-4`}
            href={`/properties/${property.slug}`}
            key={property.id}
          >
            <div
              className={styles.image}
              style={{
                backgroundImage: `url(${property.images?.[0]?.url ?? fallbackImage})`,
              }}
            >
              <span>
                {property.listing_type === "sale" ? "For sale" : "For rent"}
              </span>
            </div>
            <div className={styles.cardContent}>
              <p>
                {property.city}, {property.state ?? ""}
              </p>
              <h2>{property.title}</h2>
              <small>
                {property.bedrooms} beds · {property.bathrooms} baths ·{" "}
                {property.area_sqft?.toLocaleString() ?? "—"} sq ft
              </small>
              <strong>{price(property)}</strong>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
