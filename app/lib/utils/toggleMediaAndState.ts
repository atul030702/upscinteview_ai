import { RefObject, Dispatch, SetStateAction } from "react";

function toggleMediaAndState( 
    mediaType: "audio" | "video", 
    mediaStreamRef: RefObject<MediaStream | null>, //RefObject for media stream
    currentState: boolean, 
    setState: Dispatch<SetStateAction<boolean>> //React state dispatcher of a boolean value
): void {
    //for switching on/off the mic/video
    const stream = mediaStreamRef.current;
    if(stream) {
        const tracks = mediaType === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
        tracks.forEach((track) => track.enabled = !currentState);
    }
    //for toggling icon and bg of icons (mic/video)
    setState(!currentState);
}

export default toggleMediaAndState;