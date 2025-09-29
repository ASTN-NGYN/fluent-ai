"use client";

import { useState } from "react";
import { Card, Field, Input, Stack, Button, Select, Portal } from "@chakra-ui/react";
import { difficulties, languages } from "@/constants/locales";
import { generateContent } from "@/lib/api";

export default function ExerciseForm() {

    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [language, setLanguage] = useState<{ label: string; value: string } | null>(null);
    const [exercises, setExercises] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!topic || !difficulty || !language) {
            alert("Please fill out all fields");
            return;
        }

        try {
            const response = await generateContent({ topic, difficulty, language: language.label });
            setExercises(response.exercises);
            console.log(response.exercises);
        } catch (err) {
            console.error(err);
        }
    }

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
            <Card.Body>
                <Stack gap={4} w="full">
                    <Field.Root>
                        <Field.Label color="black">Topic</Field.Label>
                        <Input
                            placeholder="Enter a topic"
                            color="black"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{ borderColor: "gray.500", boxShadow: "0 0 0 1px gray" }}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </Field.Root>
                    <Field.Root>
                        <Select.Root collection={difficulties} size="sm" width="100%" onValueChange={(details) => setDifficulty(details.value[0] ?? "")}
                        >
                            <Select.HiddenSelect />
                            <Select.Label color="black">Select difficulty</Select.Label>
                            <Select.Control>
                                <Select.Trigger
                                    borderColor="gray.300"
                                    _hover={{ borderColor: "gray.400" }}
                                    _focus={{ borderColor: "gray.500", boxShadow: "0 0 0 1px gray" }}
                                >
                                    <Select.ValueText placeholder="Difficulty" color="black" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content bg="white" color="black">
                                        {difficulties.items.map((difficulty) => (
                                            <Select.Item
                                                key={difficulty.value}
                                                item={difficulty}
                                                _hover={{ bg: "#e9f2f1", cursor: "pointer" }}
                                                _highlighted={{ bg: "#e9f2f1" }}
                                                _focus={{ bg: "#e9f2f1" }}
                                            >
                                                {difficulty.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    </Field.Root>
                    <Field.Root>
                        <Select.Root collection={languages} size="sm" width="100%" onValueChange={(details) => {
                            const value = details.value[0];
                            const selected = languages.items.find(item => item.value === value);
                            if (selected) setLanguage(selected);
                        }}
                        >
                            <Select.HiddenSelect />
                            <Select.Label color="black">Select Language</Select.Label>
                            <Select.Control>
                                <Select.Trigger
                                    borderColor="gray.300"
                                    _hover={{ borderColor: "gray.400" }}
                                    _focus={{ borderColor: "gray.500", boxShadow: "0 0 0 1px gray" }}
                                >
                                    <Select.ValueText placeholder="Language" color="black" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                                <Select.Positioner>
                                    <Select.Content bg="white" color="black">
                                        {languages.items.map((language) => (
                                            <Select.Item
                                                key={language.value}
                                                item={language}
                                                _hover={{ bg: "#e9f2f1", cursor: "pointer" }}
                                                _highlighted={{ bg: "#e9f2f1" }}
                                                _focus={{ bg: "#e9f2f1" }}
                                            >
                                                {language.label}
                                                <Select.ItemIndicator />
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Positioner>
                            </Portal>
                        </Select.Root>
                    </Field.Root>
                </Stack>
            </Card.Body>
            <Card.Footer justifyContent={"center"}>
                <Button
                    bg="#4D869C"
                    color="white"
                    onClick={handleGenerate}
                    disabled={!topic || !difficulty || !language}
                >
                    Generate Exercises
                </Button>
            </Card.Footer>
        </Card.Root>
    );
}
