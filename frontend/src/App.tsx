import { useState, useEffect, useRef } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";

import type { CountryEntry, Recommendation, Book } from "./types";
import CountryModal from "./components/CountryModal";
import { RefreshCcw } from "lucide-react";
import InputModal from "./components/InputModal";
import ResultModal from "./components/ResultModal";
import Loading from "./components/Loading";
import { FixLeafletPointerEvents } from "./components/FixLeafletPointer";

function getColor(count: number | undefined, maxCount: number): string {
  if (!count) return "#d6d0c8";

  const intensity = 0.3 + 0.7 * (count / maxCount);

  const r = Math.round(30 * (1 - intensity));
  const g = Math.round(80 + 140 * intensity);
  const b = Math.round(30 * (1 - intensity));

  return `rgb(${r},${g},${b})`;
}

export default function App() {
  const [books, setBooks] = useState<CountryEntry[]>([]);
  const [countryMap, setCountryMap] = useState<Record<string, CountryEntry>>({});
  const [maxCount, setMaxCount] = useState<number>(1);
  const [geoData, setGeoData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Record<string, Book[]>>({});
  const [selectedRecommendation, setSelectedRecommendation] = useState<Book[] | undefined>();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CountryEntry | undefined>();
  const [stage, setStage] = useState<"input" | "loading" | "result" | "map">("input");
  const [mapReady, setMapReady] = useState(false);
  const tooltipDomRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .then((r) => r.json())
        .then(setGeoData);

    fetch('/recommendations.json')
      .then(r => r.json())
      .then((data: Recommendation[]) => {
        const map = Object.fromEntries(
          data.map((r) => [String(r.iso), r.books])
        );
        setRecommendations(map);
      });
  }, []);

  const countryMapRef = useRef(countryMap);
  useEffect(() => {
    countryMapRef.current = countryMap;
  }, [countryMap]);

  useEffect(() => {
    const moveHandler = (e: MouseEvent) => {
      if (!tooltipDomRef.current) return;
      tooltipDomRef.current.style.left = `${e.clientX + 16}px`;
      tooltipDomRef.current.style.top = `${e.clientY - 10}px`;
    };

    window.addEventListener("mousemove", moveHandler);
    return () => window.removeEventListener("mousemove", moveHandler);
  }, []);

  async function loadBooks(user: string) {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      if (res.status === 401) throw new Error("This Goodreads profile is private. Make your shelf public and try again.");
      if (res.status === 404) throw new Error("Couldn't find that Goodreads profile. Check your ID or URL.");
      throw new Error(error ?? "Something went wrong.");
    }

    const data: CountryEntry[] = await res.json();

    const map: Record<string, CountryEntry> = {};
    let max = 1;

    for (const entry of data) {
      map[entry.iso3] = entry;
      max = Math.max(max, entry.number);
    }

    setCountryMap(map);
    setMaxCount(max);
    setBooks(data);
  }

  async function handleStart(input: string) {
    setStage("loading");
    setError(null);
    try {
      await loadBooks(input);
      setStage("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStage("input");
    }
  }
  
  function getIso3(feature: any): string | undefined {
    const p = feature ?? {};
    return (
      p.iso_a3 ||
      p.ISO_A3 ||
      p.ADM0_A3 ||
      p["ISO3166-1-Alpha-3"] ||
      p.id
    );
  }

  const totalBooks = books.reduce((sum, c) => sum + c.number, 0);
  const totalCountries = books.length;

  const percentage = geoData?.features?.length
    ? ((totalCountries / geoData.features.length) * 100).toFixed(1)
    : 0;

  return (
    <Box w="100vw" h="100vh" position="relative" bg="#e8e4dc" overflow="hidden">
      {/* MODALS */}
      {stage === "input" && (
        <InputModal onStart={handleStart} error={error}/>
      )}

      {stage === "loading" && <Loading />}

      {stage === "result" && (
        <ResultModal
          booksCount={totalBooks}
          countriesCount={totalCountries}
          percentage={Number(percentage)}
          books={books}
          onContinue={() => setStage("map")}
        />
      )}

      {/* MAP */}
      {stage === "map" && (
        <>
          <Flex
            position="absolute"
            top="16px"
            left="20px"
            zIndex={1000}
            align="center"
            gap={3}
          >
            <Text fontSize="11px" color="#888">
              Read the World
            </Text>

            <Text fontSize="10px" color="#888">
              {totalBooks} books · {totalCountries} countries · {percentage}%
            </Text>

            <IconButton
              aria-label="Reset"
              size="xs"
              variant="ghost"
              onClick={() => setStage("input")}
            >
              <RefreshCcw size={10} />
            </IconButton>
          </Flex>

          <Box w="100%" h="100%">
            <MapContainer
              center={[20, 10]}
              zoom={2}
              minZoom={2}
              maxZoom={8}
              attributionControl={false}
              zoomControl={false}
              scrollWheelZoom
              whenReady={() => setMapReady(true)}
              style={{ width: "100%", height: "100%" }}
            >
              <FixLeafletPointerEvents />
              {mapReady && geoData && (
                <GeoJSON
                  data={geoData}
                  key="world"
                  style={(feature) => {
                    const iso = getIso3(feature);
                    const entry = countryMapRef.current[iso ?? ""];

                    return {
                      fillColor: getColor(entry?.number, maxCount),
                      fillOpacity: 1,
                      color: "#c8c4bc",
                      weight: 0.8,
                    };
                  }}
                  onEachFeature={(feature, layer) => {
                    const iso = getIso3(feature);

                    layer.on("mouseover", (e: L.LeafletMouseEvent) => {
                      if (!tooltipDomRef.current) return;

                      const entry = countryMapRef.current[iso ?? ""];

                      const name =
                        feature?.properties?.name ||
                        feature?.properties?.ADMIN ||
                        "Unknown";

                      tooltipDomRef.current.style.display = "block";
                      tooltipDomRef.current.style.left = `${e.originalEvent.clientX + 16}px`;
                      tooltipDomRef.current.style.top = `${e.originalEvent.clientY - 10}px`;

                      tooltipDomRef.current.innerHTML = entry
                        ? `<div style="font-family:Georgia; color:#2e7d32;">
                            <b>${name}</b><br/>
                            ${entry.number} book${entry.number !== 1 ? "s" : ""}
                          </div>`
                        : `<div style="font-family:Georgia; color:#666;">${name}</div>`;
                    });

                    layer.on("mouseout", () => {
                      if (tooltipDomRef.current) {
                        tooltipDomRef.current.style.display = "none";
                      }
                    });

                    layer.on("click", () => {
                      const iso = getIso3(feature);
                      const entry = countryMapRef.current[iso ?? ""];

                      setSelectedCountry(
                        feature?.properties?.name ?? "Unknown"
                      );
                      setSelectedEntry(entry);
                      setSelectedRecommendation(recommendations[iso ?? ""]);
                    });
                  }}
                />
              )}
            </MapContainer>
          </Box>

          {/* Tooltip */}
          <Box
            ref={tooltipDomRef}
            display="none"
            position="fixed"
            zIndex={2000}
            bg="white"
            border="1px solid #e0ddd8"
            borderRadius="8px"
            px={4}
            py={3}
            pointerEvents="none"
          />

          <CountryModal
            open={!!selectedCountry}
            countryName={selectedCountry ?? ""}
            entry={selectedEntry}
            recommendations={selectedRecommendation}
            onClose={() => {
              setSelectedCountry(null);
              setSelectedEntry(undefined);
            }}
          />
        </>
      )}
    </Box>
  );
}