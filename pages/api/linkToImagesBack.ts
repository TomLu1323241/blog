import { Media } from '../../typings';
import probe from 'probe-image-size';
import { ArchiveType } from '../../enums';

// WHEN YOU CHANGE THIS YOU ALSO NEED TO CHANGE THE FRONTEND AS WELL
export async function linkToImages(links: string[]): Promise<[Media[], number[]]> {
  // the map returns an array of arrays of Archive objects, it is an array of array because a link can be a gallery of images
  // the ... converts the array of arrays into a bunch of separate arrays
  // the concat combines everything into one array of objects
  // this is done to keep order
  const badEntries: number[] = [];
  const baseURL = 'https://i.redd.it/';
  const archives: Media[] = ([] as Media[]).concat(...await Promise.all<Media[]>(links.map(async (link: string, index: number) => {
    // Assume its a reddit url
    if (link.toLocaleLowerCase().includes('reddit')) {
      const res = await fetch(`${link.slice(0, -1)}.json`);
      const redditBody = await res.json();
      if (redditBody[0].data.children[0].data.removed_by_category) {
        badEntries.push(index);
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
    } else {
      return [];
    }
  })));
  return [archives, badEntries];
}