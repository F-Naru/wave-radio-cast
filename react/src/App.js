import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  VStack, 
  Heading, 
  Input, 
  Select, 
  Text, 
  Spinner,
  useToast 
} from '@chakra-ui/react';

function App() {
  const [frequencies, setFrequencies] = useState([]); // 周波数リストを管理するstate
  const [selectedFrequency, setSelectedFrequency] = useState(''); // 選択された周波数
  const [dateTime, setDateTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const toast = useToast();

  // ① 周波数リストを取得するAPIを呼び出す
  useEffect(() => {
    const fetchFrequencies = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/frequencies`);
        const freqList = response.data.frequencies;
        setFrequencies(freqList);
        // リストの最初の周波数をデフォルトで選択
        if (freqList.length > 0) {
          setSelectedFrequency(freqList[0]);
        }
      } catch (error) {
        console.error('Failed to fetch frequencies:', error);
        toast({
          title: 'エラー',
          description: '周波数リストの取得に失敗しました。',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchFrequencies();
  }, [toast]);

  // ② selectedFrequencyとdateTimeが変更されたら自動的に検索する
  useEffect(() => {
    if (!dateTime || !selectedFrequency) {
      return;
    }
    
    const searchRecording = async () => {
      setLoading(true);
      setAudioUrl(null);
    
      const formattedDate = dateTime.replace(/:/g, '-');
      
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/search`, {
          params: {
            frequency: selectedFrequency,
            date: formattedDate,
          },
        });
        
        if (response.data.success) {
          setAudioUrl(`${process.env.REACT_APP_API_URL}${response.data.url}`);
          toast({
            title: '再生準備完了',
            description: 'ファイルが見つかりました。',
            status: 'success',
            duration: 1000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'ファイルが見つかりません',
            description: response.data.error,
            status: 'warning',
            duration: 1000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('API Error:', error);
        toast({
          title: 'APIエラー',
          description: '録音ファイルの検索中にエラーが発生しました。',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    searchRecording();
  }, [dateTime, selectedFrequency, toast]);


  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <VStack spacing={8} maxW="container.md" mx="auto" pt={16}>
        <Heading as="h1" size="xl">
          wave-radio-cast
        </Heading>
        <Text fontSize="lg" color="gray.600">
          FMラジオの録音を再生します
        </Text>
        <VStack spacing={4} w="full">
          <Select value={selectedFrequency} onChange={(e) => setSelectedFrequency(e.target.value)}>
            {frequencies.length > 0 ? (
              frequencies.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))
            ) : (
              <option value="">周波数を取得中...</option>
            )}
          </Select>
          <Input 
            type="datetime-local" 
            value={dateTime} 
            onChange={(e) => setDateTime(e.target.value)} 
            step="60"
          />
        </VStack>
        {loading ? (
          <Spinner size="xl" color="blue.500" />
        ) : audioUrl && (
          <Box mt={8} w="full">
            <Text mb={2} fontWeight="bold">再生中...</Text>
            <audio controls autoPlay src={audioUrl} style={{ width: '100%' }}></audio>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default App;