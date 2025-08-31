'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  VStack,
  Heading,
  Input,
  Select,
  Text,
  Spinner,
  HStack
} from '@chakra-ui/react';

export default function Home() {
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const [frequencies, setFrequencies] = useState<string[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');

  const [dateTime, setDateTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 1. Fetch locations on initial load
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('/api/locations');
        const locList = response.data.locations;
        
        if (Array.isArray(locList)) {
          setLocations(locList);
          if (locList.length > 0) {
            setSelectedLocation(locList[0]);
          }
        } else {
          setLocations([]);
          console.error("API response for locations is not a valid array:", response.data);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) { // Type guard for AxiosError
            console.error('Failed to fetch locations:', error.response || error.message || error);
        } else {
            console.error('Failed to fetch locations:', error); // Fallback for non-Axios errors
        }
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  // 2. Fetch frequencies when selectedLocation changes
  useEffect(() => {
    if (!selectedLocation) return;

    const fetchFrequencies = async () => {
      setFrequencies([]);
      setSelectedFrequency('');
      setAudioUrl(null);

      try {
        const response = await axios.get('/api/frequencies', {
          params: { location: selectedLocation }
        });
        const freqList = response.data.frequencies;

        if (Array.isArray(freqList)) {
          setFrequencies(freqList);
          if (freqList.length > 0) {
            setSelectedFrequency(freqList[0]);
          }
        } else {
          setFrequencies([]);
          console.error("API response for frequencies is not a valid array:", response.data);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) { // Type guard for AxiosError
            console.error('Failed to fetch frequencies:', error.response || error.message || error);
        }
        else {
            console.error('Failed to fetch frequencies:', error); // Fallback for non-Axios errors
        }
        setFrequencies([]);
      }
    };
    fetchFrequencies();
  }, [selectedLocation]);

  // 3. Search for recording when inputs change
  const searchRecording = useCallback(async () => {
    if (!dateTime || !selectedFrequency || !selectedLocation) {
      return;
    }

    setLoading(true);
    setAudioUrl(null);
    setSearchError(null); // Clear previous errors

    try {
      const response = await axios.get('/api/search', {
        params: {
          location: selectedLocation,
          frequency: selectedFrequency,
          date: dateTime,
        },
      });

      if (response.data.success) {
        setAudioUrl(response.data.url);
        console.log("Audio URL set to:", response.data.url); // Debug log
      } else {
        setAudioUrl(null);
        setSearchError(response.data.error || 'ファイルが見つかりませんでした。');
      }
    } catch (error: unknown) {
      setAudioUrl(null);
      let errorMessage = 'ファイルの検索中にエラーが発生しました。';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setSearchError(errorMessage);
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  }, [dateTime, selectedFrequency, selectedLocation]);

  useEffect(() => {
    if (dateTime) {
      searchRecording();
    }
  }, [dateTime, searchRecording]);


  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <VStack spacing={8} maxW="container.md" mx="auto" pt={16}>
        <Heading as="h1" size="xl">
          wave-radio-cast
        </Heading>
        <Text fontSize="lg" color="gray.600">
          ラジオの録音を再生します
        </Text>
        <VStack spacing={4} w="full">
          <HStack w="full">
            <Select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              {locations.length > 0 ? (
                locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))
              ) : (
                <option value="">地点を取得中...</option>
              )}
            </Select>
            <Select value={selectedFrequency} onChange={(e) => setSelectedFrequency(e.target.value)}>
              {frequencies.length > 0 ? (
                frequencies.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))
              ) : (
                <option value="">周波数を選択...</option>
              )}
            </Select>
          </HStack>
          <Input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            step="60"
          />
        </VStack>
        
        {/* Display Area */}
        <Box mt={8} w="full" minH="120px">
          {loading ? (
            <VStack><Spinner size="xl" color="blue.500" /></VStack>
          ) : searchError ? (
            <Box bg="red.100" p={4} borderRadius="md">
              <Text color="red.700" fontWeight="bold">{searchError}</Text>
            </Box>
          ) : audioUrl ? (
            <Box>
              <Text mb={2} fontWeight="bold">再生中...</Text>
              <audio controls autoPlay src={audioUrl} style={{ width: '100%' }}></audio>
            </Box>
          ) : (
            <Box w="full" textAlign="center">
              <Text>条件を選択して録音データを検索してください。</Text>
            </Box>
          )}
        </Box>

      </VStack>
    </Box>
  );
}
