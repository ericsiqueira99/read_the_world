import {
  Box,
  Heading,
  HStack,
  Text,
  Badge,
  Image,
  IconButton,
  Link,
  VStack
} from "@chakra-ui/react";
import type { Book } from "../types";
import { SquareArrowOutUpRight } from 'lucide-react';
type Props = {
  book: Book;
  idx: number;
  showLink?: boolean;
};

function buildAmazonSearchUrl(title: string, author: string) {
  const query = encodeURIComponent(`${title} ${author}`);
  return `https://www.amazon.com/s?k=${query}`;
}

export function BookCard({
  book,
  idx,
  showLink = true
}: Props) {
  const amazonUrl = buildAmazonSearchUrl(
    book.name,
    book.author
  );

  return (
    <Box
      key={idx}
      borderBottomWidth="1px"
      pb={4}
      pt={3}
    >
      <HStack align="start" gap={4}>
        {/* Cover image */}
        {book.image ? (
            <Image
                src={book.image}
                alt={book.name}
                width="90px"
                height="135px"
                objectFit="cover"
                borderRadius="sm"
                flexShrink={0}
            />
            ) : (
            <Box
                width="90px"
                height="135px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                borderWidth="1px"
                borderRadius="sm"
                bg="gray.50"
                color="gray.500"
                fontSize="xs"
                px={2}
                flexShrink={0}
            >
                No image available
            </Box>
            )}

        {/* Main content */}
        <Box flex="1">
          <HStack justify="space-between" align="start">
            <Heading
              size="md"
              fontFamily="Georgia"
              fontWeight="normal"
            >
              {book.name}
            </Heading>

            {/* External link */}
            {showLink && (
              <Link href={amazonUrl} target="_blank" rel="noopener noreferrer">
                <IconButton
                  aria-label="Search on Amazon"
                  size="sm"
                  
                  variant="ghost"
                >
                <SquareArrowOutUpRight />
                </IconButton>
              </Link>
            )}
          </HStack>

            <VStack align="start" mt={2} gap={1}>
                <Text color="fg.muted">
                    {book.author}
                </Text>

                {book.year && (
                    <Badge variant="subtle">
                    {book.year}
                    </Badge>
                )}
            </VStack>
        </Box>
      </HStack>
    </Box>
  );
}