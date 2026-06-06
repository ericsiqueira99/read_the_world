import GoodreadsShelf from "goodreads-bookshelf-api";
import countries from "i18n-iso-countries";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const en = require("i18n-iso-countries/langs/en.json");
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
countries.registerLocale(en);

// Manual mappings for historical/unrecognized countries
const historicalMap = {
  "Russian Empire": "RUS",
  "Soviet Union": "RUS",
  "Czechoslovakia": "CZE",
  "East Germany": "DEU",
  "West Germany": "DEU",
  "Yugoslavia": "SRB",
  "Ottoman Empire": "TUR",
  "British India": "IND",
  "Cisleithania": "CZE",
  "Austrian Empire": "AUT",
  "Kingdom of Prussia": "DEU",
  "Mandatory Palestine": "PSE",
  "United Kingdom of Great Britain and Ireland": "GBR",
  "Republic of China": "TWN",
};

function toISO3(countryName) {
  if (!countryName) return null;
  if (historicalMap[countryName]) return historicalMap[countryName];
  const alpha2 = countries.getAlpha2Code(countryName, "en");
  return alpha2 ? countries.alpha2ToAlpha3(alpha2) : null;
}

// Single SPARQL query for a batch of authors
const WD_SEARCH =
  "https://www.wikidata.org/w/api.php?action=wbsearchentities&language=en&format=json&limit=1&search=";

const cache = new Map();

/**
 * Step 1: resolve author name → QID
 */
async function getQidForAuthor(name) {
  if (cache.has(name)) return cache.get(name);

  const url = WD_SEARCH + encodeURIComponent(name);

  const res = await fetch(url, {
    headers: {
      "User-Agent": "ReadTheWorld/1.0 (your@email.com)"
    }
  });

  const data = await res.json();

  const qid = data?.search?.[0]?.id || null;

  cache.set(name, qid);
  return qid;
}

/**
 * Step 2: batch fetch countries from Wikidata
 */
async function getCountriesForAuthors(authors) {
  const nameToQid = {};

  // 1. Resolve all authors → QIDs (parallel)
  await Promise.all(
    authors.map(async (a) => {
      nameToQid[a] = await getQidForAuthor(a);
    })
  );

  const qids = Object.values(nameToQid).filter(Boolean);

  if (qids.length === 0) return {};

  // 2. Batch SPARQL query
  const valuesBlock = qids.map(q => `wd:${q}`).join(" ");

  const query = `
    SELECT ?author ?countryLabel WHERE {
      VALUES ?author { ${valuesBlock} }
      ?author wdt:P27 ?country.

      SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en".
      }
    }
  `;

  const url =
    "https://query.wikidata.org/sparql?query=" +
    encodeURIComponent(query) +
    "&format=json";

  const res = await fetch(url, {
    headers: {
      "Accept": "application/sparql-results+json",
      "User-Agent": "ReadTheWorld/1.0 (your@email.com)"
    }
  });

  const text = await res.text();

  if (!res.ok) {
    console.warn("Wikidata error:", text);
    return {};
  }

  const data = JSON.parse(text);

  const qidToCountry = {};

  for (const b of data.results.bindings) {
    const qid = b.author.value.split("/").pop();
    const country = b.countryLabel?.value;

    if (qid && country && !qidToCountry[qid]) {
      qidToCountry[qid] = country;
    }
  }

  // 3. Map back QID → name
  const result = {};

  for (const [name, qid] of Object.entries(nameToQid)) {
    if (qid && qidToCountry[qid]) {
      result[name] = qidToCountry[qid];
    }
  }

  return result;
}

async function getBooksGroupedByCountry(books) {
  // Step 1: unique authors
  const uniqueAuthors = [...new Set(books.map(b => b.author))];

  // Step 2: batch authors into groups of 10, query Wikidata once per batch
  const BATCH_SIZE = 30;
  const DELAY_MS = 1000;
  const authorCountryMap = {};

  for (let i = 0; i < uniqueAuthors.length; i += BATCH_SIZE) {
    const batch = uniqueAuthors.slice(i, i + BATCH_SIZE);
    console.log(`Querying batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uniqueAuthors.length / BATCH_SIZE)}...`);
    const results = await getCountriesForAuthors(batch);
    Object.assign(authorCountryMap, results);
    if (i + BATCH_SIZE < uniqueAuthors.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  // Step 3: group books by country
  const countryMap = {};
  for (const book of books) {
    const country = authorCountryMap[book.author];
    if (!country) continue;

    if (!countryMap[country]) {
      countryMap[country] = { country, iso3: toISO3(country), number: 0, books: [] };
    }

    countryMap[country].number += 1;
    countryMap[country].books.push({
      name: book.title,
      author: book.author,
      year: book.bookPublished,
      image: book.imageLink,
    });
  }

  return Object.values(countryMap).sort((a, b) => b.number - a.number);
}

async function getUserMap(userid) {
  const myReadShelf = new GoodreadsShelf({
    username: userid,
    shelf: "read",
  });
  const data = await myReadShelf.fetch();
  const result = await getBooksGroupedByCountry(data);
  return result;
}

function parseGoodreadsUser(input) {
  const trimmed = input.trim();

  try {
    const url = new URL(trimmed);
    // Is a valid URL — extract the last path segment
    const segments = url.pathname.split("/").filter(Boolean);
    const userId = segments[segments.length - 1];
    if (!userId) throw new Error("Could not extract user ID from URL");
    return userId;
  } catch {
    // Not a URL — assume it's already a raw user ID
    if (!trimmed) throw new Error("User input is empty");
    return trimmed;
  }
}

const CACHE_DIR = "./cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCachedResult(userId) {
  const path = join(CACHE_DIR, `${userId}.json`);
  if (!existsSync(path)) return null;

  const { timestamp, data } = JSON.parse(readFileSync(path, "utf-8"));
  if (Date.now() - timestamp > CACHE_TTL_MS) return null; // stale

  return data;
}

function setCachedResult(userId, data) {
  const path = join(CACHE_DIR, `${userId}.json`);
  writeFileSync(path, JSON.stringify({ timestamp: Date.now(), data }));
}

export { getUserMap, parseGoodreadsUser, getCachedResult, setCachedResult };
