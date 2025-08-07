"use client";
import React, { useState } from "react";

interface Advertiser {
  id: string;
  name: string;
  description: string;
  countries: string[];
  url: string;
  domain: string;
  image: string;
  payPerLead?: number;
  payPerSale?: number;
  currency: string;
  autoRedirect: boolean;
  trackinglink: string;
  deeplink: boolean;
  offerType: string;
  categories: string[];
  metrics: any[];
}

interface ApiResponse {
  total: number;
  size: number;
  page: number;
  advertisers: Advertiser[];
}

const Advertisers: React.FC = () => {
  const [siteId, setSiteId] = useState("12eafe68f1fa43d5ab3a745a173a7837");
  const [country, setCountry] = useState("DE");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [format, setFormat] = useState("json");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAdvertisers = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/advertisers?site_id=${siteId}&country=${country}&page_size=${pageSize}&page=${page}&format=${format}`
      );
      if (!res.ok) throw new Error("Failed to fetch advertisers");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Advertisers</h1>
        <form
          onSubmit={fetchAdvertisers}
          className="flex flex-wrap gap-4 items-center justify-center bg-white dark:bg-neutral-900 p-6 rounded-xl shadow mb-8"
        >
          <input
            type="text"
            value={siteId}
            onChange={e => setSiteId(e.target.value)}
            placeholder="Site ID"
            className="border rounded px-3 py-2 focus:outline-none focus:ring w-40"
          />
          <input
            type="text"
            value={country}
            onChange={e => setCountry(e.target.value)}
            placeholder="Country"
            className="border rounded px-3 py-2 focus:outline-none focus:ring w-32"
          />
          <input
            type="number"
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            placeholder="Page Size"
            className="border rounded px-3 py-2 focus:outline-none focus:ring w-28"
          />
          <input
            type="number"
            value={page}
            onChange={e => setPage(Number(e.target.value))}
            placeholder="Page"
            className="border rounded px-3 py-2 focus:outline-none focus:ring w-24"
          />
          <input
            type="text"
            value={format}
            onChange={e => setFormat(e.target.value)}
            placeholder="Format"
            className="border rounded px-3 py-2 focus:outline-none focus:ring w-24"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-blue-700 transition"
          >
            {loading ? "Loading..." : "Fetch"}
          </button>
        </form>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {data && (
          <div>
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <div className="bg-blue-50 dark:bg-neutral-800 rounded-lg px-4 py-2 text-lg font-medium">Total: {data.total}</div>
              <div className="bg-blue-50 dark:bg-neutral-800 rounded-lg px-4 py-2 text-lg font-medium">Page: {data.page}</div>
              <div className="bg-blue-50 dark:bg-neutral-800 rounded-lg px-4 py-2 text-lg font-medium">Size: {data.size}</div>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.advertisers.map(ad => (
                <li
                  key={ad.id}
                  className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 flex flex-col gap-2 border border-neutral-200 dark:border-neutral-800 hover:scale-[1.02] transition"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <img
                      src={ad.image}
                      alt={ad.name}
                      className="w-24 h-14 object-contain rounded bg-neutral-100 dark:bg-neutral-800 border"
                    />
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{ad.name}</h2>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">{ad.offerType}</span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-1">{ad.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">Countries: {ad.countries.join(", ")}</span>
                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">Domain: {ad.domain}</span>
                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">Currency: {ad.currency}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">Pay Per Lead: {ad.payPerLead ?? "-"}</span>
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">Pay Per Sale: {ad.payPerSale ?? "-"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">Deeplink: {ad.deeplink ? "Yes" : "No"}</span>
                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">Auto Redirect: {ad.autoRedirect ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">Categories: {ad.categories.length ? ad.categories.join(", ") : "-"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                    <a
                      href={ad.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800"
                    >
                      Visit Website
                    </a>
                    <a
                      href={ad.trackinglink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800"
                    >
                      Tracking Link
                    </a>
                  </div>
                  <div className="mt-2">
                    <strong className="block mb-1 text-sm">Metrics:</strong>
                    <ul className="space-y-1">
                      {ad.metrics.map((m, idx) => (
                        <li key={idx} className="text-xs bg-neutral-50 dark:bg-neutral-800 rounded px-2 py-1">
                          {m.description} | Country: {m.country || "-"} | Currency: {m.currency} | CPC: {m.cpc ?? "-"} | CR: {m.cr} | Commission: {m.commission}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Advertisers;
