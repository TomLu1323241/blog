import { LocationForm } from '../shared/location';

export default function LocationCard({ location, googleMapsUrl, region, preNotes, postNotes, image }: LocationForm) {
  const hasPostVisit = !!(postNotes?.length ?? 0 !== 0);
  let imageSrc;
  if (typeof image === 'string') {
    imageSrc = image;
  } else {
    if (typeof window === 'undefined') {
      imageSrc = '/placeholder.png';
    } else {
      imageSrc = image ? window.URL.createObjectURL(image) : '/placeholder.png';
    }
  }
  return (
    <div className='flex flex-col overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-900'>
      <img className='h-56 w-full object-cover md:h-96' src={imageSrc} />
      <div className={`flex flex-col p-4`}>
        <div className='flex flex-col justify-between'>
          <div className='flex flex-row justify-between'>
            <h1 className='text-3xl'>{location}</h1>
            <p>toggle</p>
          </div>
          <div className='flex flex-row justify-between'>
            <a
              href={googleMapsUrl}
              className='text-blue-600 hover:underline dark:text-blue-500'
              target='_blank'
              rel='noopener noreferrer'
            >
              maps
            </a>
            <p>{region}</p>
          </div>
        </div>
        <div className='flex flex-row'>
          <div className={hasPostVisit ? 'w-1/2' : ''}>
            <h2 className='text-xl'>Pre-visit notes</h2>
            <ul className='list-inside list-disc'>
              {preNotes?.split('\n').map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
          {hasPostVisit && (
            <div className='w-1/2'>
              <h2 className='text-xl'>Post-visit notes</h2>
              <ul className='list-inside list-disc'>
                {postNotes?.split('\n').map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
