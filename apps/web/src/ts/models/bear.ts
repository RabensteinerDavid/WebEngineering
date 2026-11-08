export interface Bear {
  name: string;
  binomial: string;
  fileName: string | null;
  range: string;
}

export interface BearWithImage extends Bear {
  image: string;
}
