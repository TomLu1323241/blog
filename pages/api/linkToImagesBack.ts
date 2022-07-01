import { Archive } from '../../typings';
import probe from 'probe-image-size';
import { ArchiveType } from '../../enums';

// WHEN YOU CHANGE THIS YOU ALSO NEED TO CHANGE THE FRONTEND AS WELL
export async function linkToImages(links: string[]): Promise<Archive[]> {
  // the map returns an array of arrays of Archive objects, it is an array of array because a link can be a gallery of images
  // the ... converts the array of arrays into a bunch of separate arrays
  // the concat combines everything into one array of objects
  // this is done to keep order
  const baseURL = 'https://i.redd.it/';
  const archives: Archive[] = ([] as Archive[]).concat(...await Promise.all<Archive[]>(links.map(async (link: string) => {
    // Assume its a reddit url
    const res = await fetch(`${link.slice(0, -1)}.json`);
    const redditBody = await res.json();
    if (redditBody[0].data.children[0].data.url.includes('gallery')) {
      const data = redditBody[0].data.children[0].data.media_metadata;
      const temp = [];
      for (const key of Object.keys(data)) {
        const mediaSrc = `${baseURL}${key}.${data[key].m.split('/')[1]}`;
        const imageDetails = await probe(mediaSrc);
        temp.push({
          src: link,
          mediaSrc,
          type: ArchiveType.reddit,
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
          type: ArchiveType.reddit,
          height: imageDetails.height,
          width: imageDetails.width,
        }
      ];
    }
  })));
  return archives;
}