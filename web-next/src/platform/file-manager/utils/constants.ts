/** Formats that the API file scanner stores and the browser viewer can render. */
export const MEDIA_VIEWER_CONFIG = {
  IFRAME_EXTENSIONS: ["pdf"],
  IMAGE_EXTENSIONS: ["jpg", "jpeg", "png", "gif", "bmp", "webp"],
  VIDEO_EXTENSIONS: ["mp4", "webm", "mov", "qt", "avi"],
  AUDIO_EXTENSIONS: ["mp3", "wav", "ogg"],
  get VIEWABLE_EXTENSIONS() {
    return [
      ...this.IFRAME_EXTENSIONS,
      ...this.IMAGE_EXTENSIONS,
      ...this.VIDEO_EXTENSIONS,
      ...this.AUDIO_EXTENSIONS,
    ];
  },
} as const;
