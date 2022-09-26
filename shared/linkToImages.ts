import { Media } from './typings';
import probe from 'probe-image-size';
import { MediaType } from './enums';

// WHEN YOU CHANGE THIS YOU ALSO NEED TO CHANGE THE BACKEND AS WELL
export async function linkToImages(links: string[]): Promise<Media[]> {
  // the map returns an array of arrays of Archive objects, it is an array of array because a link can be a gallery of images
  // the ... converts the array of arrays into a bunch of separate arrays
  // the concat combines everything into one array of objects
  // this is done to keep order
  const baseURL = 'https://i.redd.it/';
  const archives: Media[] = ([] as Media[]).concat(...await Promise.all<Media[]>(links.map(async (link: string, index: number) => {
    try {
      // Assume its a reddit url
      if (link.toLocaleLowerCase().includes('reddit')) {
        const res = await fetch(`${link.slice(0, -1)}.json`);
        const redditBody = await res.json();
        if (redditBody[0].data.children[0].data.removed_by_category !== null) {
          return [];
        }
        if (redditBody[0].data.children[0].data.url.includes('gallery')) {
          const data = redditBody[0].data.children[0].data.media_metadata;
          const temp = [];
          for (const key of Object.keys(data)) {
            const mediaSrc = `${baseURL}${key}.${data[key].m.split('/')[1]}`;
            const imageDetails = await probe(mediaSrc);
            temp.push({
              src: link,
              mediaSrc,
              type: MediaType.Reddit,
              height: imageDetails.height,
              width: imageDetails.width,
            });
          }
          return temp;
        } else {
          const mediaSrc = redditBody[0].data.children[0].data.url;
          const imageDetails = await probe(mediaSrc);
          return [
            {
              src: link,
              mediaSrc,
              type: MediaType.Reddit,
              height: imageDetails.height,
              width: imageDetails.width,
            }
          ];
        }
      }
      // check if url is image
      if ((await fetch(link)).headers.get('content-type')?.toLocaleLowerCase().includes('image')) {
        const imageDetails = await probe(link);
        return [
          {
            src: link,
            mediaSrc: link,
            type: MediaType.RawImage,
            height: imageDetails.height,
            width: imageDetails.width,
          }
        ];
      }
    } catch {

    }
    return [];
  })));
  return archives;
}
