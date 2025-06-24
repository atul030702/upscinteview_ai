//Making webkitAudioContext valid across the app for use
export {};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}