import { useMemo } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import type { CountryModalProps } from "../types";
import { BookCard } from "./BookCard";

export default function CountryModal({
  open,
  onClose,
  countryName,
  entry,
  recommendations = [],
}: CountryModalProps) {
  const defaultTab = useMemo(
    () => (entry ? "books" : "recommendations"),
    [entry]
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      size={["full", "xl"]}
    >
      <Dialog.Backdrop />

      <Dialog.Positioner>
        <Dialog.Content maxH="80vh" display="flex" flexDirection="column">
          <Dialog.Header>
            <Flex justify="space-between" align="start" w="full">
              <Box>
                <Dialog.Title>
                  <Text fontFamily="Georgia">
                    {countryName}
                  </Text>
                </Dialog.Title>

                <Text color="fg.muted" mt={1}>
                  {entry
                    ? `${entry.number} book${
                        entry.number !== 1 ? "s" : ""
                      } read`
                    : "No books logged yet"}
                </Text>
              </Box>

              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
            </Flex>
          </Dialog.Header>

          <Dialog.Body p={0} overflowY="auto" flex="1">
            <Tabs.Root defaultValue={defaultTab}>
              <Tabs.List px={6}>
                {entry && (
                  <Tabs.Trigger value="books">
                    Books
                  </Tabs.Trigger>
                )}

                <Tabs.Trigger value="recommendations">
                  Recommendations
                </Tabs.Trigger>
              </Tabs.List>

              {entry && (
                <Tabs.Content value="books">
                  <Stack p={6} gap={5}>
                    {entry.books.map((book, idx) => (
                      <BookCard book={book} idx={idx}/>
                    ))}
                  </Stack>
                </Tabs.Content>
              )}

              <Tabs.Content value="recommendations">
                <Stack p={6} gap={5}>
                  {recommendations.length === 0 ? (
                    <Text color="fg.muted">
                      No recommendations available.
                    </Text>
                  ) : (
                    recommendations.map((book, idx) => (
                      <BookCard book={book} idx={idx} showLink={true}/>
                    ))
                  )}
                </Stack>
              </Tabs.Content>
            </Tabs.Root>
          </Dialog.Body>

          <Dialog.Footer>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}