import { Spinner, Box, Text } from "@chakra-ui/react";

export default function Laoding() {

return(
    <Box
        position="absolute"
        inset={0}
        zIndex={3000}
        bg="rgba(255,255,255,0.6)"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={3}
    >
        <Spinner size="lg" />

        <Text fontSize="lg" color="#444">
            Fetching and processing data...
        </Text>
    </Box>
)
}