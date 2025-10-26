import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionHook {
    isListening: boolean;
    transcript: string;
    startListening: () => Promise<void>;
    stopListening: () => void;
    hasRecognitionSupport: boolean;
    error: string | null;
}
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const useSpeechRecognition = (): SpeechRecognitionHook => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const hasRecognitionSupport = !!SpeechRecognition;

    useEffect(() => {
        if (!hasRecognitionSupport) {
            setError('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const results = event.results;
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < results.length; i++) {
                const transcript = results[i][0].transcript;
                if (results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                }
            }
            
            setTranscript(prev => prev + finalTranscript);
        };

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            
            switch (event.error) {
                case 'not-allowed':
                case 'permission-denied':
                    setError('Microphone permission denied. Please allow microphone access in your browser settings.');
                    break;
                case 'audio-capture':
                    setError('No microphone found. Please check your audio hardware.');
                    break;
                default:
                    setError(`Speech recognition error: ${event.error}`);
            }
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [hasRecognitionSupport, SpeechRecognition]);

    const startListening = async (): Promise<void> => {
        setError(null);
        setTranscript('');
        
        try {
            // Request microphone permission first
            await navigator.mediaDevices.getUserMedia({ audio: true });
            recognitionRef.current?.start();
        } catch (err: any) {
            console.error('Microphone access error:', err);
            setError('Cannot access microphone. Please check your browser permissions and ensure a microphone is connected.');
        }
    };

    const stopListening = (): void => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    return { 
        isListening, 
        transcript, 
        startListening, 
        stopListening, 
        hasRecognitionSupport, 
        error 
    };
};

export default useSpeechRecognition;