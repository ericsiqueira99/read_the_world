import { useState } from "react";
import { Box, Text } from "@chakra-ui/react";

type Props = {
  onStart: (value: string) => void;
  error?: string | null;
};

export default function InputModal({ error, onStart }: Props) {
  const [value, setValue] = useState("");

  return (
    <Box
      position="absolute"
      inset={0}
      zIndex={3000}
      bg="rgba(0,0,0,0.35)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        p={[6, 8, 10]}
        borderRadius="16px"
        w="100%"
        maxW="560px"
        boxShadow="0 24px 60px rgba(0,0,0,0.18)"
      >
        <Text
          mb={2}
          fontSize={["22px", "25px", "28px"]}
          fontWeight="700"
          color="gray.800"
          lineHeight="1.2"
        >
          How much of the world have you read?
        </Text>

        <Text mb={7} fontSize={["13px", "14px", "15px"]} color="gray.500" lineHeight="1.6">
          Connect your Goodreads profile to visualize the countries and cultures
          represented in your reading history — mapped across the globe.
        </Text>

        {/* Stack vertically on mobile, row on larger */}
        <Box display="flex" flexDirection={["column", "row"]} gap={2}>
          <input
            style={{
              flex: 1,
              padding: "10px 14px",
              border: `1.5px solid ${error ? "#ef4444" : "#c5d4c6"}`,
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
            }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onStart(value);
            }}
            placeholder="Goodreads user ID or profile URL"
          />
          <button
            style={{
              padding: "10px 22px",
              background: "#2e7d32",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => onStart(value)}
          >
            Start
          </button>
        </Box>

        {error && (
          <Text fontSize="13px" color="red.500" mt={2}>
            {error}
          </Text>
        )}

        <Text mt={5} fontSize="13px" color="gray.400" textAlign="center">
          Your data is never stored. We only read your public Goodreads shelf to generate the map.
        </Text>
      </Box>
    </Box>
  );
}