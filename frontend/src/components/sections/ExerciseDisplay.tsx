"use client";

import { useState, useRef, useEffect } from "react";
import { Card, Stack, Button, HStack, VStack, Text, Box, Spinner, IconButton } from "@chakra-ui/react";
import { FaPlay, FaPause } from "react-icons/fa";
import { assessPronunciation } from "@/lib/api";
import type { AssessmentResponse } from "@/lib/api";

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
    languageCode: string;
};

type RecordingState = "idle" | "recording" | "recorded" | "submitting" | "completed";

export default function ExerciseDisplay({ exercises, topic, difficulty, language, languageCode }: ExerciseDisplayProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const [showRomanized, setShowRomanized] = useState(true);
    
    // Recording state per exercise
    const [recordingStates, setRecordingStates] = useState<Map<number, RecordingState>>(new Map());
    const [audioBlobs, setAudioBlobs] = useState<Map<number, Blob>>(new Map());
    const [assessmentResults, setAssessmentResults] = useState<Map<number, AssessmentResponse>>(new Map());
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Reset all state when new exercises are generated
    useEffect(() => {
        // Stop any ongoing recording
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        // Stop audio playback
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
        }
        
        // Reset all state
        setCurrentIndex(0);
        setShowTranslation(false);
        setShowRomanized(true);
        setRecordingStates(new Map());
        setAudioBlobs(new Map());
        setAssessmentResults(new Map());
        setRecordingTime(0);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
    }, [exercises]);

    // Reset recording state when exercise changes
    useEffect(() => {
        const state = recordingStates.get(currentIndex) || "idle";
        if (state === "recording") {
            stopRecording();
        }
        setRecordingTime(0);
        // Stop audio playback when switching exercises
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setCurrentTime(0);
        }
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
        }
    }, [currentIndex]);

    // Update volume when it changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
            }
        };
    }, []);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const getCurrentState = (): RecordingState => {
        return recordingStates.get(currentIndex) || "idle";
    };

    const setCurrentState = (state: RecordingState) => {
        setRecordingStates(prev => new Map(prev).set(currentIndex, state));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            audioChunksRef.current = [];

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                setAudioBlobs(prev => new Map(prev).set(currentIndex, audioBlob));
                setCurrentState("recorded");
                
                // Stop all tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            };

            mediaRecorder.start();
            setCurrentState("recording");
            setRecordingTime(0);
            
            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Unable to access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && getCurrentState() === "recording") {
            mediaRecorderRef.current.stop();
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleReRecord = () => {
        stopRecording();
        
        // Stop and cleanup any existing stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        // Reset MediaRecorder and audio chunks
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
        
        // Stop audio playback if playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setCurrentTime(0);
            audioRef.current = null;
        }
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
        }
        
        setCurrentState("idle");
        setAudioBlobs(prev => {
            const newMap = new Map(prev);
            newMap.delete(currentIndex);
            return newMap;
        });
        setAssessmentResults(prev => {
            const newMap = new Map(prev);
            newMap.delete(currentIndex);
            return newMap;
        });
        setRecordingTime(0);
        setCurrentTime(0);
        setDuration(0);
    };

    const handlePlayPause = async () => {
        const audioBlob = audioBlobs.get(currentIndex);
        if (!audioBlob) return;

        if (!audioRef.current) {
            // Create new audio element
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.volume = volume;
            audioRef.current = audio;

            audio.onloadedmetadata = () => {
                setDuration(audio.duration);
            };

            audio.onended = () => {
                setIsPlaying(false);
                setCurrentTime(0);
                if (progressTimerRef.current) {
                    clearInterval(progressTimerRef.current);
                    progressTimerRef.current = null;
                }
            };

            audio.onerror = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
                audioRef.current = null;
                alert("Error playing audio. Please try recording again.");
            };

            try {
                await audio.play();
                setIsPlaying(true);

                // Start progress tracking
                progressTimerRef.current = setInterval(() => {
                    if (audioRef.current) {
                        setCurrentTime(audioRef.current.currentTime);
                        if (!isNaN(audioRef.current.duration)) {
                            setDuration(audioRef.current.duration);
                        }
                    }
                }, 100);
            } catch (error) {
                console.error("Error playing audio:", error);
                setIsPlaying(false);
            }
        } else {
            // Toggle play/pause
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
                if (progressTimerRef.current) {
                    clearInterval(progressTimerRef.current);
                    progressTimerRef.current = null;
                }
            } else {
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                    progressTimerRef.current = setInterval(() => {
                        if (audioRef.current) {
                            setCurrentTime(audioRef.current.currentTime);
                        }
                    }, 100);
                } catch (error) {
                    console.error("Error playing audio:", error);
                    setIsPlaying(false);
                }
            }
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const handleSubmit = async () => {
        const audioBlob = audioBlobs.get(currentIndex);
        if (!audioBlob) return;

        setCurrentState("submitting");

        try {
            // Convert blob to File
            const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
            const referenceText = showRomanized ? exercises[currentIndex].romanized : exercises[currentIndex].native;

            const result = await assessPronunciation({
                reference_text: referenceText,
                language: languageCode,
                audio_file: audioFile
            });

            setAssessmentResults(prev => new Map(prev).set(currentIndex, result));
            setCurrentState("completed");
        } catch (error) {
            console.error("Error assessing pronunciation:", error);
            alert("Failed to assess pronunciation. Please try again.");
            setCurrentState("recorded");
        }
    };

    if (!exercises || exercises.length === 0) {
        return null;
    }

    const currentExercise = exercises[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === exercises.length - 1;
    const currentState = getCurrentState();
    const currentAssessment = assessmentResults.get(currentIndex);

    const handlePrevious = () => {
        if (!isFirst) {
            if (currentState === "recording") {
                stopRecording();
            }
            setCurrentIndex(currentIndex - 1);
            setShowTranslation(false);
            setRecordingTime(0);
        }
    };

    const handleNext = () => {
        if (!isLast) {
            if (currentState === "recording") {
                stopRecording();
            }
            setCurrentIndex(currentIndex + 1);
            setShowTranslation(false);
            setRecordingTime(0);
        }
    };

    const toggleTranslation = () => {
        setShowTranslation(!showTranslation);
    };

    const toggleTextFormat = () => {
        setShowRomanized(!showRomanized);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
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

                    {/* Recording Section */}
                    <Box w="full" pt={4} borderTop="1px solid #e9ecef">
                        <VStack gap={4} w="full">
                            <Text fontSize="md" fontWeight="semibold" color="black">
                                Record Your Pronunciation
                            </Text>
                            
                            {currentState === "recording" && (
                                <HStack gap={2}>
                                    <Box
                                        w="12px"
                                        h="12px"
                                        borderRadius="50%"
                                        bg="red.500"
                                        css={{
                                            animation: "pulse 1.5s ease-in-out infinite",
                                        }}
                                    />
                                    <Text color="red.500" fontWeight="medium">
                                        Recording... {formatTime(recordingTime)}
                                    </Text>
                                </HStack>
                            )}

                            <HStack gap={3} w="full" justify="center">
                                {currentState === "idle" && (
                                    <Button
                                        bg="#4D869C"
                                        color="white"
                                        onClick={startRecording}
                                        _hover={{ bg: "#3d6d7c" }}
                                    >
                                        Record
                                    </Button>
                                )}

                                {currentState === "recording" && (
                                    <Button
                                        bg="red.500"
                                        color="white"
                                        onClick={stopRecording}
                                        _hover={{ bg: "red.600" }}
                                    >
                                        Stop Recording
                                    </Button>
                                )}

                                {currentState === "recorded" && (
                                    <VStack gap={4} w="full">
                                        {/* Audio Player */}
                                        <HStack gap={3} w="full" align="center">
                                            <IconButton
                                                bg={isPlaying ? "red.500" : "#4D869C"}
                                                color="white"
                                                onClick={handlePlayPause}
                                                _hover={{ bg: isPlaying ? "red.600" : "#3d6d7c" }}
                                                aria-label={isPlaying ? "Pause" : "Play"}
                                                size="xs"
                                                w="28px"
                                                h="28px"
                                            >
                                                {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                                            </IconButton>
                                            <Box flex={1} position="relative" h="4px">
                                                <Box
                                                    w="full"
                                                    h="4px"
                                                    bg="#e9ecef"
                                                    borderRadius="2px"
                                                    position="absolute"
                                                    top="0"
                                                    left="0"
                                                />
                                                <Box
                                                    position="absolute"
                                                    top="0"
                                                    left="0"
                                                    h="4px"
                                                    bg="#4D869C"
                                                    borderRadius="2px"
                                                    width={`${duration ? (currentTime / duration) * 100 : 0}%`}
                                                    transition="width 0.1s linear"
                                                />
                                            </Box>
                                            <HStack gap={2} align="center">
                                                <Text fontSize="sm" color="gray.600">Vol:</Text>
                                                <Box position="relative" w="80px">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="1"
                                                        step="0.1"
                                                        value={volume}
                                                        onChange={handleVolumeChange}
                                                        style={{
                                                            width: "100%",
                                                            WebkitAppearance: "none",
                                                            appearance: "none",
                                                            height: "4px",
                                                            borderRadius: "2px",
                                                            background: `linear-gradient(to right, #4D869C 0%, #4D869C ${volume * 100}%, #e9ecef ${volume * 100}%, #e9ecef 100%)`,
                                                            outline: "none",
                                                            cursor: "pointer",
                                                        }}
                                                        className="volume-slider"
                                                    />
                                                </Box>
                                            </HStack>
                                        </HStack>

                                        {/* Action Buttons */}
                                        <HStack gap={3} w="full" justify="center">
                                            <Button
                                                bg="#4D869C"
                                                color="white"
                                                onClick={handleSubmit}
                                                _hover={{ bg: "#3d6d7c" }}
                                            >
                                                Submit for Scoring
                                            </Button>
                                            <Button
                                                variant="outline"
                                                borderColor="#4D869C"
                                                color="#4D869C"
                                                onClick={handleReRecord}
                                                _hover={{ bg: "#4D869C", color: "white" }}
                                            >
                                                Re-record
                                            </Button>
                                        </HStack>
                                    </VStack>
                                )}

                                {currentState === "submitting" && (
                                    <HStack gap={2}>
                                        <Spinner size="sm" color="#4D869C" />
                                        <Text color="gray.600">Submitting...</Text>
                                    </HStack>
                                )}
                            </HStack>
                        </VStack>
                    </Box>

                    {/* Feedback Results Section */}
                    {currentState === "completed" && currentAssessment && (
                        <Box
                            w="full"
                            p={6}
                            bg="#f0f9ff"
                            borderRadius="xl"
                            border="2px solid #4D869C"
                            mt={4}
                        >
                            <VStack gap={4} align="stretch">
                                <Text fontSize="lg" fontWeight="bold" color="#1a365d">
                                    Assessment Results
                                </Text>

                                {/* Overall Scores */}
                                <Box
                                    p={4}
                                    bg="white"
                                    borderRadius="lg"
                                    border="1px solid #b3d9ff"
                                >
                                    <Text fontSize="md" fontWeight="semibold" color="black" mb={3}>
                                        Overall Scores
                                    </Text>
                                    <VStack gap={2} align="stretch">
                                        <HStack justify="space-between">
                                            <Text color="gray.700">Accuracy:</Text>
                                            <Text fontWeight="bold" color={currentAssessment.overall.accuracy >= 80 ? "green.600" : currentAssessment.overall.accuracy >= 60 ? "orange.600" : "red.600"}>
                                                {currentAssessment.overall.accuracy}%
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text color="gray.700">Completeness:</Text>
                                            <Text fontWeight="bold" color={currentAssessment.overall.completeness >= 80 ? "green.600" : currentAssessment.overall.completeness >= 60 ? "orange.600" : "red.600"}>
                                                {currentAssessment.overall.completeness}%
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text color="gray.700">Fluency:</Text>
                                            <Text fontWeight="bold" color={currentAssessment.overall.fluency >= 80 ? "green.600" : currentAssessment.overall.fluency >= 60 ? "orange.600" : "red.600"}>
                                                {currentAssessment.overall.fluency}%
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text color="gray.700">Pronunciation:</Text>
                                            <Text fontWeight="bold" color={currentAssessment.overall.pronunciation >= 80 ? "green.600" : currentAssessment.overall.pronunciation >= 60 ? "orange.600" : "red.600"}>
                                                {currentAssessment.overall.pronunciation}%
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text color="gray.700">Prosody:</Text>
                                            <Text fontWeight="bold" color={currentAssessment.overall.prosody >= 80 ? "green.600" : currentAssessment.overall.prosody >= 60 ? "orange.600" : "red.600"}>
                                                {currentAssessment.overall.prosody}%
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </Box>

                                {/* Word-level Feedback */}
                                {currentAssessment.words.length > 0 && (
                                    <Box
                                        p={4}
                                        bg="white"
                                        borderRadius="lg"
                                        border="1px solid #b3d9ff"
                                    >
                                        <Text fontSize="md" fontWeight="semibold" color="black" mb={3}>
                                            Word-by-Word Feedback
                                        </Text>
                                        <VStack gap={3} align="stretch">
                                            {currentAssessment.words.map((word, idx) => (
                                                <Box
                                                    key={idx}
                                                    p={3}
                                                    bg={word.word_accuracy >= 90 ? "#f0fdf4" : word.word_accuracy >= 70 ? "#fffbeb" : "#fef2f2"}
                                                    borderRadius="md"
                                                    borderLeft="4px solid"
                                                    borderLeftColor={word.word_accuracy >= 90 ? "green.500" : word.word_accuracy >= 70 ? "orange.500" : "red.500"}
                                                >
                                                    <HStack justify="space-between" mb={2}>
                                                        <Text fontWeight="semibold" color="black">
                                                            "{word.word}"
                                                        </Text>
                                                        <Text
                                                            fontSize="sm"
                                                            fontWeight="bold"
                                                            color={word.word_accuracy >= 90 ? "green.600" : word.word_accuracy >= 70 ? "orange.600" : "red.600"}
                                                        >
                                                            {word.word_accuracy}%
                                                        </Text>
                                                    </HStack>
                                                    
                                                    {word.feedback && typeof word.feedback === "object" && !("error" in word.feedback) && (
                                                        <VStack gap={2} align="stretch" mt={2}>
                                                            {"word_tip" in word.feedback && word.feedback.word_tip && (
                                                                <Text fontSize="sm" color="gray.700" fontStyle="italic">
                                                                    {word.feedback.word_tip}
                                                                </Text>
                                                            )}
                                                            {"phonemes" in word.feedback && Array.isArray(word.feedback.phonemes) && word.feedback.phonemes.length > 0 && (
                                                                <Box>
                                                                    <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={1}>
                                                                        Phoneme Tips:
                                                                    </Text>
                                                                    {word.feedback.phonemes.map((phoneme: { phoneme: string; tip: string }, pIdx: number) => (
                                                                        <Text key={pIdx} fontSize="xs" color="gray.600" ml={2}>
                                                                            • {phoneme.phoneme}: {phoneme.tip}
                                                                        </Text>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                        </VStack>
                                                    )}
                                                </Box>
                                            ))}
                                        </VStack>
                                    </Box>
                                )}

                                <Button
                                    size="sm"
                                    variant="outline"
                                    borderColor="#4D869C"
                                    color="#4D869C"
                                    onClick={handleReRecord}
                                    _hover={{ bg: "#4D869C", color: "white" }}
                                >
                                    Record Again
                                </Button>
                            </VStack>
                        </Box>
                    )}
                </VStack>
            </Card.Body>

            <Card.Footer>
                <HStack gap={4} w="full" justify="center">
                    <Button
                        bg="#4D869C"
                        color="white"
                        onClick={handlePrevious}
                        disabled={isFirst || currentState === "recording"}
                        _disabled={{ bg: "gray.300", cursor: "not-allowed" }}
                    >
                        Previous
                    </Button>
                    
                    <Button
                        bg="#4D869C"
                        color="white"
                        onClick={handleNext}
                        disabled={isLast || currentState === "recording"}
                        _disabled={{ bg: "gray.300", cursor: "not-allowed" }}
                    >
                        Next
                    </Button>
                </HStack>
            </Card.Footer>
        </Card.Root>
    );
}
