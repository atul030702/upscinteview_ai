function detectSpeaking(
    stream: MediaStream,
    onSpeaking: (isSpeaking: boolean) => void
): void {
    try {
        // Audio context for processing audio in the browser
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Creating source node from the mic stream
        const source = audioContext.createMediaStreamSource(stream);
        
        // Analyser node for accessing audio data
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; // Increased for better accuracy
        analyser.smoothingTimeConstant = 0.8; // Smoothing for less jittery results
        
        // Use frequency data instead of time domain for better voice detection
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Connect mic source to analyser
        source.connect(analyser);

        let lastSpeakingState = false;
        let speakingCount = 0;
        const speakingThreshold = 20; // Adjusted threshold
        const consecutiveFrames = 3; // Require multiple frames to confirm speaking

        // Function to continuously check if user is speaking
        const checkIfSpeaking = (): void => {
            // Get frequency data instead of time domain
            analyser.getByteFrequencyData(dataArray);
            
            // Calculate average volume across frequency spectrum
            // Focus on speech frequencies (roughly 85Hz to 8000Hz)
            let sum = 0;
            const speechStart = Math.floor((85 / (audioContext.sampleRate / 2)) * bufferLength);
            const speechEnd = Math.floor((8000 / (audioContext.sampleRate / 2)) * bufferLength);
            
            for (let i = speechStart; i < Math.min(speechEnd, dataArray.length); i++) {
                sum += dataArray[i];
            }
            
            const avgVolume = sum / (speechEnd - speechStart);
            const isSpeakingNow = avgVolume > speakingThreshold;
            
            // Use consecutive frame counting to reduce false positives
            if (isSpeakingNow) {
                speakingCount++;
            } else {
                speakingCount = Math.max(0, speakingCount - 1);
            }
            
            const isSpeaking = speakingCount >= consecutiveFrames;
            
            // Only call callback if state changed
            if (isSpeaking !== lastSpeakingState) {
                console.log("Volume:", avgVolume.toFixed(2), "Is speaking:", isSpeaking);
                onSpeaking(isSpeaking);
                lastSpeakingState = isSpeaking;
            }
            
            // Continue checking
            requestAnimationFrame(checkIfSpeaking);
        };

        // Handle audio context state
        const startDetection = () => {
            if (audioContext.state === 'suspended') {
                audioContext.resume()
                    .then(() => {
                        console.log('Audio context resumed, starting speech detection');
                        checkIfSpeaking();
                    })
                    .catch((error) => console.error('Failed to resume audio context:', error));
            } else {
                console.log('Starting speech detection');
                checkIfSpeaking();
            }
        };

        startDetection();

    } catch (error) {
        console.error('Error in detectSpeaking:', error);
    }
}

export default detectSpeaking;