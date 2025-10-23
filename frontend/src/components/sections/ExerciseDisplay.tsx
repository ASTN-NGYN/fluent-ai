"use client";

import { useState } from "react";
import { Card, Stack, Button, HStack, VStack, Text, Box } from "@chakra-ui/react";

type Exercise = {
    native: string;
    romanized: string;
    translation: string;
};

type ExerciseDisplayProps = {
    exercises: Exercise[];
    topic?: string;
    difficulty?: string;
    language?: string;
};

export default function ExerciseDisplay({ exercises, topic, difficulty, language }: ExerciseDisplayProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const [showRomanized, setShowRomanized] = useState(true);

    if (!exercises || exercises.length === 0) {
        return null;
    }

    const currentExercise = exercises[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === exercises.length - 1;

    const handlePrevious = () => {
        if (!isFirst) {
            setCurrentIndex(currentIndex - 1);
            setShowTranslation(false);
        }
    };

    const handleNext = () => {
        if (!isLast) {
            setCurrentIndex(currentIndex + 1);
            setShowTranslation(false);
        }
    };

    const toggleTranslation = () => {
        setShowTranslation(!showTranslation);
    };

    const toggleTextFormat = () => {
        setShowRomanized(!showRomanized);
    };

    return (
        <Card.Root
            maxW="xl"
            mx="auto"
            mt={10}
            bg="white"
            borderRadius="2xl"
            border="none"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
        >
            <Card.Header>
                <VStack gap={2} w="full">
                    {topic && (
                        <Text fontSize="lg" fontWeight="semibold" color="black">
                            Topic: {topic}
                        </Text>
                    )}
                    {difficulty && language && (
                        <Text fontSize="sm" color="gray.600">
                            {difficulty} • {language}
                        </Text>
                    )}
                    <Text fontSize="sm" color="gray.500">
                        Exercise {currentIndex + 1} of {exercises.length}
                    </Text>
                </VStack>
            </Card.Header>

            <Card.Body>
                <VStack gap={6} w="full">
                    {/* Main exercise text */}
                    <Box
                        minH="120px"
                        w="full"
                        p={6}
                        bg="#f8f9fa"
                        borderRadius="xl"
                        border="1px solid #e9ecef"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Text
                            fontSize="2xl"
                            fontWeight="medium"
                            color="black"
                            textAlign="center"
                            lineHeight="1.6"
                        >
                            {showRomanized ? currentExercise.romanized : currentExercise.native}
                        </Text>
                    </Box>

                    {/* Translation (if shown) */}
                    {showTranslation && (
                        <Box
                            w="full"
                            p={4}
                            bg="#e8f4fd"
                            borderRadius="lg"
                            border="1px solid #b3d9ff"
                        >
                            <Text
                                fontSize="lg"
                                color="#1a365d"
                                textAlign="center"
                                fontStyle="italic"
                            >
                                {currentExercise.translation}
                            </Text>
                        </Box>
                    )}

                    {/* Action buttons */}
                    <HStack gap={3} w="full" justify="center">
                        <Button
                            size="sm"
                            variant="outline"
                            borderColor="#4D869C"
                            color="#4D869C"
                            _hover={{ bg: "#4D869C", color: "white" }}
                            onClick={toggleTextFormat}
                        >
                            {showRomanized ? "Show Native" : "Show Romanized"}
                        </Button>
                        
                        <Button
                            size="sm"
                            variant="outline"
                            borderColor="#4D869C"
                            color="#4D869C"
                            _hover={{ bg: "#4D869C", color: "white" }}
                            onClick={toggleTranslation}
                        >
                            {showTranslation ? "Hide Translation" : "Show Translation"}
                        </Button>
                    </HStack>
                </VStack>
            </Card.Body>

            <Card.Footer>
                <HStack gap={4} w="full" justify="center">
                    <Button
                        bg="#4D869C"
                        color="white"
                        onClick={handlePrevious}
                        disabled={isFirst}
                        _disabled={{ bg: "gray.300", cursor: "not-allowed" }}
                    >
                        Previous
                    </Button>
                    
                    <Button
                        bg="#4D869C"
                        color="white"
                        onClick={handleNext}
                        disabled={isLast}
                        _disabled={{ bg: "gray.300", cursor: "not-allowed" }}
                    >
                        Next
                    </Button>
                </HStack>
            </Card.Footer>
        </Card.Root>
    );
}
