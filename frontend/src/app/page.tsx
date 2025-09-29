"use client";

import { Box, Heading, Text } from "@chakra-ui/react";
import ExerciseForm from "@/components/sections/GenerateExerciseForm";

export default function Home() {
  return (
    <Box
      minH="100vh"
      px={{ base: 4, sm: 6, md: 8 }}
      bg="linear-gradient(to bottom, #7AB2B2 0%, #7AB2B2 30%, #CDE8E5 100%)"
    >
      <Box as="header" py={8} textAlign="center" bg="transparent">
        <Heading size="5xl" color="white">
          Fluent AI
        </Heading>
        <Text fontSize="xl" color="white" mt={2}>
          AI-powered pronunciation practice with real-time feedback
        </Text>
      </Box>

      <ExerciseForm />
    </Box>
  );
}
