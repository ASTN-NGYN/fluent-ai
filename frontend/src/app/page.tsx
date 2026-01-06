"use client";

import { useState } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import ExerciseForm from "@/components/sections/GenerateExerciseForm";
import ExerciseDisplay from "@/components/sections/ExerciseDisplay";

type Exercise = {
  native: string;
  romanized: string;
  translation: string;
};

type ExerciseData = {
  topic: string;
  difficulty: string;
  language: string;
  languageCode: string;
  exercises: Exercise[];
};

export default function Home() {
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);

  const handleExercisesGenerated = (data: ExerciseData) => {
    setExerciseData(data);
  };

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

      <ExerciseForm onExercisesGenerated={handleExercisesGenerated} />
      {exerciseData && (
        <ExerciseDisplay 
          exercises={exerciseData.exercises}
          topic={exerciseData.topic}
          difficulty={exerciseData.difficulty}
          language={exerciseData.language}
          languageCode={exerciseData.languageCode}
        />
      )}
    </Box>
  );
}
