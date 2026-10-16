"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiUrl } from "../api";
import styles from "./page.module.css";

type Agent = {
  id: number;
  name: string;
  email: string;
  published_properties_count: number;
};

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
      {/* Header */}
      <header className="container-xl">
        <div className="d-flex justify-content-between align-items-center py-4">
          <Link className={styles.brand} href="/">
            <span className={styles.brandMark}>N</span>
            <span>
              northstar<span>.</span>
            </span>
          </Link>
          <Link className={styles.back} href="/">
            Back to home <span>↙</span>
          </Link>
        </div>
      </header>

      {/* Intro Section */}
      <section className={`${styles.intro} container-xl`}>
        <div className="row">
          <div className="col-12 col-md-8 col-lg-6">
            <p className={styles.eyebrow}>People who know the place</p>
            <h1>
              Meet your local
              <br />
              <em>Northstar experts.</em>
            </h1>
            <p>
              Good advice starts with someone who knows the light, the streets,
              and what makes a home feel right.
            </p>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Experts Grid */}
      <section className="container-xl pb-5 mb-5">
        <div className="row g-4">
          {agents.map((agent) => (
            <div className="col-12 col-md-6 col-xl-4" key={agent.id}>
              <article className={styles.card}>
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
            </div>
          ))}
        </div>
      </section>

      {/* Empty State */}
      {!error && agents.length === 0 && (
        <p className={styles.empty}>
          Our local experts are preparing their collections.
        </p>
      )}
    </main>
  );
}
