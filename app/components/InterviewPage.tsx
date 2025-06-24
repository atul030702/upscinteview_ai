"use client"
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

import getMediaPermission from "../lib/utils/getMediaAccess";
import toggleMediaAndState from "../lib/utils/toggleMediaAndState";
import detectSpeaking from "../lib/utils/detectSpeaking";

const InterviewPage = () => {
    const [isMicOn, setIsMicOn] = useState<boolean>(true);
    const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false); //Tracking user mic for audio
    const mediaStreamRef = useRef<MediaStream | null>(null); //For toggling video/mic on/off on button click
    const videoElementRef = useRef<HTMLVideoElement | null>(null);//For showing live video feed in the element

    useEffect(() => {
        const setupMediaStream = async () => {
            const stream = await getMediaPermission();
            
            if(stream) {
                mediaStreamRef.current = stream;

                if(videoElementRef.current) {
                    videoElementRef.current.srcObject = stream;
                    videoElementRef.current.play();
                }

                detectSpeaking(stream, setIsSpeaking);
            }
        };

        setupMediaStream();
    }, []);

    const toggleMic = () => toggleMediaAndState("audio", mediaStreamRef, isMicOn, setIsMicOn);
    const toggleVideo = () => toggleMediaAndState("video", mediaStreamRef, isVideoOn, setIsVideoOn);


    return (
        <div className="w-full h-screen flex justify-center items-center p-10">

            <div className="w-[70%] h-full mr-2.5 flex flex-col justify-between">
                {/**Board member video/audio will display */}
                <div className="w-full aspect-video text-center rounded-sm bg-gray-300">
                    Panel Video/Audio
                </div>

                <div className="w-full flex justify-between items-center">
                    {/**User Video display div */}
                    <div className="relative w-1/6 aspect-video rounded-sm">
                        <video 
                            ref={videoElementRef}
                            id="user-video"
                            className="w-full h-full object-cover rounded-sm"
                            autoPlay
                            muted
                            playsInline
                        >
                        </video>
                        {/** Speaking animation */}
                        {isMicOn && isSpeaking && (
                            <div className="absolute top-0 right-0 inset-0 bg-green-500 bg-opacity-40 rounded-sm animate-pulse border-2 border-green-400 pointer-events-none z-10"></div>
                        )}
                    </div>

                    <div className="w-1/6 h-full flex flex-col justify-end whitespace-nowrap">
                        {/**Mic and Video Button and their behavior */}
                        <div className="w-full flex justify-between items-center mb-2.5">

                            <button onClick={toggleMic} 
                                className={`p-2 rounded-full cursor-pointer transition ${isMicOn ? "bg-green-700 hover:bg-green-700/90" : "bg-red-500 hover:bg-red-500/90"}`}
                            >
                                <Image
                                    src={isMicOn ? "/mic_on.svg" : "/mic_off.svg"}
                                    alt="Mic Icon"
                                    width={30}
                                    height={30}
                                    priority
                                />
                            </button>

                            <button onClick={toggleVideo} 
                                className={`p-2 rounded-full cursor-pointer transition ${isVideoOn ? "bg-green-700 hover:bg-green-700/90" : "bg-red-500 hover:bg-red-500/90"}`}
                            >
                                <Image
                                    src={isVideoOn ? "/videocam_on.svg" : "/videocam_off.svg"}
                                    alt="Videocam Icon"
                                    width={30}
                                    height={30}
                                    priority
                                />
                            </button>

                        </div>
                        {/**Button for ending the interview */}
                        <button className="w-full py-2 px-2.5 rounded-sm cursor-pointer text-white bg-red-500 hover:bg-red-500/90 transition">
                            End Interview
                        </button>
                    </div>
                </div>
            </div>
            {/**Transcript display Div */}
            <div className="w-[25%] h-full ml-2.5 text-center rounded-sm bg-gray-300">
                Transcripts
            </div>
        </div>
    );
};

export default InterviewPage;
