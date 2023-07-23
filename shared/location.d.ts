export interface LocationForm {
  _id?: string;
  location: string;
  googleMapsUrl: string;
  region: string;
  preNotes: string;
  postNotes: string;
  image: File | string | undefined;
}
