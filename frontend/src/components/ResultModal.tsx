import { Box, Text } from "@chakra-ui/react";
import { ISO_TO_CONTINENT, type CountryEntry } from "../types";
import html2canvas from "html2canvas";
import { useRef } from "react";

function getContinentsCount(books: CountryEntry[]): number {
  const continents = new Set(books.map((b) => ISO_TO_CONTINENT[b.iso3] ?? null).filter(Boolean));
  return continents.size;
}

function getHeadline(pct: number) {
  if (pct >= 60) return "Incredible — you're basically a world citizen! 🌍";
  if (pct >= 40) return "Impressive reading passport! 🗺️";
  if (pct >= 20) return "Not bad, globe-trotter! 🌍";
  if (pct >= 10) return "A solid start — the world awaits! 📚";
  return "Every great journey starts with one book! 🌱";
}

function getSubtext(pct: number, countries: number, continents: number) {
  const base = `You've read books from ${countries} countr${countries === 1 ? "y" : "ies"} across ${continents} continent${continents === 1 ? "" : "s"}.`;
  if (pct >= 40) return `${base} You're painting the map green — almost there!`;
  if (pct >= 20) return `${base} Keep reading and paint the whole map green.`;
  return `${base} Each new country you discover unlocks a piece of the world.`;
}

type Props = {
  booksCount: number;
  countriesCount: number;
  percentage: number;
  books: CountryEntry[];
  onContinue: () => void;
};

export default function ResultModal({
  booksCount,
  countriesCount,
  percentage,
  books,
  onContinue,
}: Props) {
  const pct = Math.round(percentage);
  const continentsCount = getContinentsCount(books);
  const top3 = [...books].sort((a, b) => b.number - a.number).slice(0, 3);
  const bannerRef = useRef<HTMLDivElement>(null);
  const circumference = 2 * Math.PI * 58;
  const dashOffset = circumference - (pct / 100) * circumference;

  const shareText = `I've read books from ${countriesCount} countries — ${pct}% of the world! Check yours: `;
  const shareUrl = window.location.href;

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
  }

  async function shareInstagram() {
    if (!bannerRef.current) return;
    const canvas = await html2canvas(bannerRef.current, { scale: 2 });
    const link = document.createElement("a");
    link.download = "my-reading-map.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
  }

  const shareButtons = [
    {
      label: "Twitter",
      onClick: shareTwitter,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      onClick: shareWhatsApp,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      label: "Instagram",
      onClick: shareInstagram,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="url(#igGrad)">
          <defs>
            <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433"/>
              <stop offset="25%" stopColor="#e6683c"/>
              <stop offset="50%" stopColor="#dc2743"/>
              <stop offset="75%" stopColor="#cc2366"/>
              <stop offset="100%" stopColor="#bc1888"/>
            </linearGradient>
          </defs>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
    },
    {
      label: "Copy link",
      onClick: copyLink,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
      ),
    },
  ];

  return (
    <Box
      position="absolute"
      inset={0}
      zIndex={3000}
      bg="rgba(0,0,0,0.35)"
      display="flex"
      alignItems={["flex-start", "center"]}
      justifyContent="center"
      overflowY="auto"
      p={4}
    >
      <Box
        bg="white"
        p={[6, 8, 10]}
        borderRadius="20px"
        w="100%"
        maxW="520px"
        textAlign="center"
        boxShadow="0 24px 60px rgba(0,0,0,0.15)"
        ref={bannerRef}
        my={[4, "auto"]}
      >
        {/* Label */}
        <Text fontSize="11px" fontWeight="600" letterSpacing="0.1em" color="gray.400" textTransform="uppercase" mb={5}>
          Your reading map
        </Text>

        {/* Ring — slightly smaller on mobile */}
        <Box display="flex" justifyContent="center" mb={6} position="relative">
          <svg width="120" height="120" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="58" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="70" cy="70" r="58" fill="none"
              stroke="#2e7d32" strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
          </svg>
          <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
            <Text fontSize={["26px", "32px"]} fontWeight="700" color="gray.800" lineHeight="1">{pct}%</Text>
            <Text fontSize="12px" color="gray.400" mt="2px">of the world</Text>
          </Box>
        </Box>

        {/* Headline + subtext */}
        <Text fontSize={["18px", "20px", "22px"]} fontWeight="600" color="gray.800" mb={2}>
          {getHeadline(pct)}
        </Text>
        <Text fontSize={["13px", "14px", "15px"]} color="gray.500" lineHeight="1.6" mb={7}>
          {getSubtext(pct, countriesCount, continentsCount)}
        </Text>

        {/* Stats row */}
        <Box display="flex" gap={3} mb={7}>
          {[
            { value: countriesCount, label: "countries" },
            { value: continentsCount, label: "continents" },
            { value: booksCount, label: "books read" },
          ].map(({ value, label }) => (
            <Box key={label} flex={1} bg="gray.50" borderRadius="10px" py={3}>
              <Text fontSize={["18px", "22px"]} fontWeight="700" color="gray.800">{value}</Text>
              <Text fontSize="12px" color="gray.400" mt="2px">{label}</Text>
            </Box>
          ))}
        </Box>

        {/* Top 3 countries */}
        <Box mb={7} textAlign="left">
          <Text fontSize="13px" color="gray.400" mb={3} textAlign="center">
            Most read countries
          </Text>
          <Box display="flex" flexDirection="column" gap={3}>
            {top3.map((c, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              const barWidth = Math.round((c.number / top3[0].number) * 100);
              return (
                <Box key={c.iso3} display="flex" alignItems="center" gap={3}>
                  <Text fontSize="18px" w="28px">{medals[i]}</Text>
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Text fontSize="14px" color="gray.700" fontWeight="500">{c.country}</Text>
                      <Text fontSize="13px" color="gray.400">{c.number} books</Text>
                    </Box>
                    <Box bg="gray.100" borderRadius="full" h="5px">
                      <Box bg="#2e7d32" h="5px" borderRadius="full" w={`${barWidth}%`} opacity={1 - i * 0.2} />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Share — 2x2 grid on mobile, single row on desktop */}
        <Text fontSize="13px" color="gray.400" mb={3}>Share your result</Text>
        <Box
          display="grid"
          gridTemplateColumns={["1fr 1fr", "repeat(4, 1fr)"]}
          gap={2}
          mb={6}
        >
          {shareButtons.map(({ label, onClick, icon }) => (
            <button
              key={label}
              onClick={onClick}
              style={{
                padding: "8px 0",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "white",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </Box>

        {/* CTA */}
        <button
          onClick={onContinue}
          style={{
            width: "100%",
            padding: "12px",
            background: "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Show my map
        </button>
      </Box>
    </Box>
  );
}