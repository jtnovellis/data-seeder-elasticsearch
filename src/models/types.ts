export interface IndexProperty {
  type: string;
  properties?: Record<string, IndexProperty>;
  [key: string]: any;
}

export interface IndexMapping {
  dynamic?: string | boolean;
  properties: Record<string, IndexProperty>;
}

export interface IndexBody {
  mappings: IndexMapping;
  [key: string]: any;
}

export interface IndexMetadataSettings {
  index: Record<string, any>;
  [key: string]: any;
}

export interface IndexMetadata {
  settings: IndexMetadataSettings;
  [key: string]: any;
}

export interface IndexConfig {
  name: string;
  reindex: boolean;
  body: IndexBody;
  metadata: IndexMetadata;
}

export interface Comment {
  type: string;
  content?: string;
  user?: string;
  timestamp?: Date;
  [key: string]: any;
}

export interface Document {
  title: string;
  comments?: Comment[];
  published_at: string;
  [key: string]: any;
}