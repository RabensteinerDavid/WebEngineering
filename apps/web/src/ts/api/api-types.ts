export interface BearDataResponse {
  parse: {
    wikitext: {
      '*': string;
    };
  };
}

export interface ImageInfo {
  url: string;
}

export interface ImagePage {
  imageinfo?: ImageInfo[];
}

export interface ImageDataResponse {
  query: {
    pages: Record<string, ImagePage>;
  };
}
