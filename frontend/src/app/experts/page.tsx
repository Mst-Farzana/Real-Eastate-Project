"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Agent = {
  id: number;
  name: string;
  email: string;
  published_properties_count: number;
};
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export default function ExpertsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`${apiUrl}/agents`, { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Experts could not be loaded.");
        return response.json();
      })
      .then(setAgents)
      .catch((requestError) => setError(requestError.message));
  }, []);
  return (
    <main className={styles.page}>
      <header className={`${styles.header} container-xl`}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>N</span>
          <span>
            northstar<span>.</span>
          </span>
        </Link>
        <Link className={styles.back} href="/">
          Back to home <span>↙</span>
        </Link>
      </header>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>People who know the place</p>
        <h1>
          Meet your local
          <br />
          <em>Northstar experts.</em>
        </h1>
        <p>
          Good advice starts with someone who knows the light, the streets, and
          what makes a home feel right.
        </p>
      </section>
      {error && <p className={styles.error}>{error}</p>}
      <section className={`${styles.grid} container-xl row g-4`}>
        {agents.map((agent) => (
          <article
            className={`${styles.card} col-12 col-md-6 col-xl-4`}
            key={agent.id}
          >
            <div className={styles.avatar}>
              {agent.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <p className={styles.role}>Northstar advisor</p>
            <h2>{agent.name}</h2>
            <p className={styles.contact}>
              {agent.published_properties_count} published{" "}
              {agent.published_properties_count === 1 ? "home" : "homes"}
            </p>
            <a href={`mailto:${agent.email}`} className={styles.email}>
              Start a conversation ↗
            </a>
          </article>
        ))}
      </section>
      {!error && agents.length === 0 && (
        <p className={styles.empty}>
          Our local experts are preparing their collections.
        </p>
      )}
    </main>
  );
}
