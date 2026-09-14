"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useEffectEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./page.module.css";
import { RootState, toggleSavedHome } from "./store";
import { apiUrl } from "./api";

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
  country: string;
  images?: { url: string }[];
};

const formatPrice = (property: Property) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: property.currency,
    maximumFractionDigits: 0,
  }).format(Number(property.price)) +
  (property.listing_type === "rent" ? " / mo" : "");

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("All homes");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [userName, setUserName] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [propertyError, setPropertyError] = useState("");
  const dispatch = useDispatch();
  const saved = useSelector((state: RootState) => state.savedHomes);
  const router = useRouter();

  const toggleSaved = (id: number) => dispatch(toggleSavedHome(id));

  const loadProperties = async () => {
    setLoadingProperties(true);
    setPropertyError("");
    const params = new URLSearchParams({ per_page: "12" });
    if (location.trim()) params.set("city", location.trim());
    if (activeFilter !== "All homes")
      params.set("listing_type", activeFilter === "For sale" ? "sale" : "rent");
    if (propertyType) params.set("property_type", propertyType);
    if (budget === "under-1000000") params.set("max_price", "1000000");
    if (budget === "over-1000000") params.set("min_price", "1000000");

    try {
      const response = await fetch(
        `${apiUrl}/properties?${params.toString()}`,
        {
          headers: { Accept: "application/json" },
        },
      );
      if (!response.ok) throw new Error("Unable to load homes right now.");
      const data = await response.json();
      setProperties(data.data ?? []);
    } catch (error) {
      setProperties([]);
      setPropertyError(
        error instanceof Error
          ? error.message
          : "Unable to load homes right now.",
      );
    } finally {
      setLoadingProperties(false);
    }
  };
  const requestProperties = useEffectEvent(loadProperties);

  useEffect(() => {
    const request = window.setTimeout(() => void requestProperties(), 0);
    return () => window.clearTimeout(request);
  }, [activeFilter]);

  useEffect(() => {
    const request = window.setTimeout(() => {
      setUserName(window.localStorage.getItem("northstar_user") ?? "");
      setIsHydrated(true);
    }, 0);
    return () => window.clearTimeout(request);
  }, []);

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const endpoint = authMode === "login" ? "login" : "register";

    try {
      const response = await fetch(`${apiUrl}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message ??
            Object.values(data.errors ?? {})
              .flat()
              .join(" ") ??
            "Unable to sign in.",
        );
      window.localStorage.setItem("northstar_token", data.token);
      window.localStorage.setItem("northstar_user", data.user.name);
      setUserName(data.user.name);
      setAuthOpen(false);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    const token = window.localStorage.getItem("northstar_token");
    await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }).catch(() => undefined);
    window.localStorage.removeItem("northstar_token");
    window.localStorage.removeItem("northstar_user");
    setUserName("");
  };

  return (
    <main className={styles.page}>
      <nav className={`${styles.navbar} container-xl`}>
        <a className={styles.brand} href="#top">
          <span className={styles.brandMark}>N</span>
          <span>
            northstar<span className={styles.brandDot}>.</span>
          </span>
        </a>
        <div className={styles.navLinks}>
          <a href="#homes">Find a home</a>
          <a href="#journal">Journal</a>
          <a href="#agents">For agents</a>
        </div>
        <div className={styles.navActions}>
          {isHydrated && userName ? (
            <button className={styles.signIn} onClick={signOut}>
              {userName} · Sign out
            </button>
          ) : (
            <button
              className={styles.signIn}
              onClick={() => {
                setAuthMode("login");
                setAuthOpen(true);
              }}
            >
              Sign in
            </button>
          )}
          <button className={styles.listButton}>
            List your property <span>↗</span>
          </button>
        </div>
      </nav>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Curated homes. Considered living.</p>
          <h1>
            Find a place
            <br />
            <em>worth coming home to.</em>
          </h1>
          <p className={styles.heroText}>
            Northstar brings a sharper eye to the homes that shape your
            everyday. Explore exceptional properties across the US and UK.
          </p>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroImage} />
          <div className={styles.heroNote}>
            <span>01 / 04</span>
            <strong>
              Morning light
              <br />
              in West Austin
            </strong>
            <span className={styles.arrow}>↗</span>
          </div>
        </div>
        <div className={styles.searchPanel}>
          <label className={styles.searchField}>
            <span className={styles.searchIcon}>⌕</span>
            <div>
              <small>Location</small>
              <input
                aria-label="Search by location"
                placeholder="Where are you looking?"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
          </label>
          <div className={styles.searchDivider} />
          <label className={styles.searchField}>
            <span>⌂</span>
            <div>
              <small>Property type</small>
              <select
                aria-label="Filter by property type"
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
              >
                <option value="">Any type</option>
                <option value="single_family">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
              </select>
            </div>
          </label>
          <div className={styles.searchDivider} />
          <label className={styles.searchField}>
            <span>＄</span>
            <div>
              <small>Price range</small>
              <select
                aria-label="Filter by price"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
              >
                <option value="">Any budget</option>
                <option value="under-1000000">Under $1m</option>
                <option value="over-1000000">$1m and above</option>
              </select>
            </div>
          </label>
          <button className={styles.searchButton} onClick={loadProperties}>
            Search homes <span>↗</span>
          </button>
        </div>
      </section>

      <section className={`${styles.discovery} container-xl`} id="homes">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>A better way to move</p>
            <h2>Homes with a point of view.</h2>
          </div>
          <Link href="/properties" className={styles.textLink}>
            View all homes <span>↗</span>
          </Link>
        </div>
        <div className={styles.filterBar}>
          {["All homes", "For sale", "For rent"].map((filter) => (
            <button
              key={filter}
              className={`btn btn-link ${activeFilter === filter ? styles.activeFilter : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        {loadingProperties && (
          <p className={styles.statusMessage}>Finding available homes...</p>
        )}
        {propertyError && (
          <p className={styles.errorMessage}>{propertyError}</p>
        )}
        {!loadingProperties && !propertyError && properties.length === 0 && (
          <p className={styles.statusMessage}>No homes match those filters.</p>
        )}
        <div className={`${styles.propertyGrid} row g-4`}>
          {properties.map((property) => (
            <article
              className={`${styles.propertyCard} col-12 col-md-6 col-xl-4`}
              key={property.id}
              onClick={() => {
                router.push(`/properties/${property.slug}`);
              }}
              role="link"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter")
                  router.push(`/properties/${property.slug}`);
              }}
            >
              <div
                className={styles.cardImage}
                style={{
                  backgroundImage: `url(${property.images?.[0]?.url ?? "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=85"})`,
                }}
              >
                <span className={styles.cardTag}>
                  {property.listing_type === "sale" ? "For sale" : "For rent"}
                </span>
                <button
                  className={styles.saveButton}
                  aria-label={`Save ${property.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSaved(property.id);
                  }}
                >
                  {saved.includes(property.id) ? "♥" : "♡"}
                </button>
              </div>
              <div className={styles.cardBody}>
                <div>
                  <p className={styles.cardCity}>
                    {property.city}, {property.state ?? property.country}
                  </p>
                  <h3>{property.title}</h3>
                  <p className={styles.cardMeta}>
                    {property.bedrooms} beds · {property.bathrooms} baths ·{" "}
                    {property.area_sqft?.toLocaleString() ?? "—"} sq ft
                  </p>
                </div>
                <strong className={styles.price}>
                  {formatPrice(property)}
                </strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.statement} id="journal">
        <p className={styles.eyebrow}>Our north star</p>
        <h2>
          Real estate should feel
          <br />
          <em>personal, not transactional.</em>
        </h2>
        <p>
          From the first search to the front door, we make the process clearer,
          calmer, and a little more human.
        </p>
        <a href="/experts" className={styles.outlineButton}>
          Meet our local experts <span>↗</span>
        </a>
      </section>
      <footer className={styles.footer} id="agents">
        <a className={styles.brand} href="#top">
          <span className={styles.brandMark}>N</span>
          <span>
            northstar<span className={styles.brandDot}>.</span>
          </span>
        </a>
        <span>Independent real estate for modern living.</span>
        <span>© 2025 Northstar Estates</span>
      </footer>

      {authOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => setAuthOpen(false)}
        >
          <section
            className={styles.authModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              aria-label="Close sign in"
              onClick={() => setAuthOpen(false)}
            >
              ×
            </button>
            <p className={styles.eyebrow}>Welcome to Northstar</p>
            <h2 id="auth-title">
              {authMode === "login"
                ? "Sign in to your shortlist."
                : "Create your Northstar account."}
            </h2>
            <form onSubmit={submitAuth}>
              {authMode === "register" && (
                <label>
                  Full name
                  <input name="name" required autoComplete="name" />
                </label>
              )}
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                />
              </label>
              {authMode === "register" && (
                <label>
                  Confirm password
                  <input
                    name="password_confirmation"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </label>
              )}
              {authError && <p className={styles.authError}>{authError}</p>}
              <button className={styles.authSubmit} disabled={authBusy}>
                {authBusy
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>
            <button
              className={styles.authSwitch}
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setAuthError("");
              }}
            >
              {authMode === "login"
                ? "New to Northstar? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
