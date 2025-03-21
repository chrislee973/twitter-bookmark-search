export interface User {
  id: string;
  name: string;
  handle: string;
  profilePicUrl: string;
  verified: boolean;
}

enum MediaType {
  PHOTO = "photo",
  VIDEO = "video",
  GIF = "animated_gif",
}

interface MediaEntity {
  // type: MediaType;
  type: string;
  url: string;
  video_src?: VideoSource[];
}

interface VideoSource {
  content_type: string;
  url: string;
  bitrate?: number;
}

export interface Link {
  shortUrl: string;
  expandedUrl: string;
}

export interface Tweet {
  id: string;
  date: string;
  text: string;
  url: string;
  links: Link[];
  user: User;
  media: MediaEntity[];
  quote_status: Tweet | null;
}
