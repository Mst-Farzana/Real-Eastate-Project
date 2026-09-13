"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import styles from "./page.module.css";

type Property = {
  title: string;
  description: string | null;
  listing_type: "sale" | "rent";
  price: string;
  currency: string;
  bedrooms: number;
  bathrooms: string;
  area_sqft: number | null;
  address_line: string;
  city: string;
  state: string | null;
  country: string;
  images?: { url: string; alt_text: string | null }[];
  amenities?: { name: string }[];
  agent?: { name: string; email: string };
};
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";
const fallbackImage =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1500&q=85";

export default function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`${apiUrl}/properties/${slug}`, {
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("This home is no longer available.");
        return response.json();
      })
      .then(setProperty)
      .catch((requestError) => setError(requestError.message));
  }, [slug]);

  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${apiUrl}/properties/${slug}/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(
          Object.fromEntries(new FormData(event.currentTarget).entries()),
        ),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message ??
            Object.values(data.errors ?? {})
              .flat()
              .join(" ") ??
            "Please check your details.",
        );
      }
      setSent(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not send your inquiry.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (error && !property)
    return (
      <main className={styles.page}>
        <Link className={styles.back} href="/properties">
          ↙ Back to homes
        </Link>
        <p className={styles.error}>{error}</p>
      </main>
    );
  if (!property)
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Loading this home...</p>
      </main>
    );
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: property.currency,
    maximumFractionDigits: 0,
  }).format(Number(property.price));

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>N</span>
          <span>
            northstar<span>.</span>
          </span>
        </Link>
        <Link className={styles.back} href="/properties">
          ↙ Back to homes
        </Link>
      </header>
      <section className={styles.hero}>
        <div
          className={styles.heroImage}
          style={{
            backgroundImage: `url(${property.images?.[0]?.url ?? fallbackImage})`,
          }}
        />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            {property.listing_type === "sale" ? "For sale" : "For rent"} ·{" "}
            {property.city}
          </p>
          <h1>{property.title}</h1>
          <p className={styles.address}>
            {property.address_line}, {property.city},{" "}
            {property.state ?? property.country}
          </p>
          <strong className={styles.price}>
            {amount}
            {property.listing_type === "rent" ? " / mo" : ""}
          </strong>
        </div>
      </section>
      <section className={`${styles.content} container-xl row g-0`}>
        <div className="col-12 col-lg-7">
          <div className={styles.stats}>
            <span>
              <b>{property.bedrooms}</b> beds
            </span>
            <span>
              <b>{property.bathrooms}</b> baths
            </span>
            <span>
              <b>{property.area_sqft?.toLocaleString() ?? "—"}</b> sq ft
            </span>
          </div>
          <p className={styles.description}>
            {property.description ??
              "A considered home with room to make it your own."}
          </p>
          {property.amenities && (
            <div className={styles.amenities}>
              {property.amenities.map((amenity) => (
                <span key={amenity.name}>{amenity.name}</span>
              ))}
            </div>
          )}
        </div>
        <aside className={`${styles.inquiry} col-12 col-lg-5`}>
          <p className={styles.eyebrow}>Make it yours</p>
          <h2>Ask about this home.</h2>
          {sent ? (
            <p className={styles.success}>
              Your inquiry has been received.{" "}
              {property.agent?.name ?? "Our team"} will be in touch soon.
            </p>
          ) : (
            <form onSubmit={submitInquiry}>
              <input
                className="form-control"
                name="name"
                placeholder="Your name"
                required
              />
              <input
                className="form-control"
                name="email"
                type="email"
                placeholder="Email address"
                required
              />
              <input
                className="form-control"
                name="phone"
                placeholder="Phone (optional)"
              />
              <textarea
                className="form-control"
                name="message"
                placeholder="Tell us what you would like to know"
                rows={5}
                required
              />
              <button className="btn btn-dark w-100" disabled={busy}>
                {busy ? "Sending..." : "Send inquiry ↗"}
              </button>
              {error && <p className={styles.error}>{error}</p>}
            </form>
          )}
        </aside>
      </section>
    </main>
  );
}
