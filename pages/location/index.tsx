import { GetStaticProps } from 'next';
import Header from '../../components/header';
import LocationCard from '../../components/locationCard';
import UploadLocation from '../../components/uploadLocation';
import { LocationForm } from '../../shared/location';
import { sanityClient, urlFor } from '../../shared/sanity';
import { useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useTheme } from 'next-themes';
import { PlusIcon } from '@heroicons/react/outline';

export default function Locations({ _locations }: { _locations: LocationForm[] }) {
  const { theme } = useTheme();
  const [locations, setLocations] = useState(_locations);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onSortByLocation = async () => {
    let long: string, lat: string;
    try {
      ({ long, lat } = await new Promise<{ long: string; lat: string }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              long: String(pos.coords.longitude),
              lat: String(pos.coords.latitude),
            });
          },
          (error) => reject(error),
          { enableHighAccuracy: true }
        );
      }));
      const res = await fetch('api/location?' + new URLSearchParams({ long, lat }), { method: 'GET' });
      const body: LocationForm[] = await res.json();
      setLocations(body);
    } catch {
      console.log('whoop we dont know where u are');
    }
  };

  return (
    <>
      <ToastContainer
        position='top-right'
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme as 'light' | 'dark'}
      />
      <div className='mx-auto max-w-7xl'>
        <Header />
        <button type='button' onClick={onSortByLocation}>
          sort by location
        </button>
        <div className='grid grid-cols-1 gap-3 px-2 sm:grid-cols-1 lg:grid-cols-2'>
          {locations.map((location, index) => {
            return <LocationCard {...location} key={index} />;
          })}
        </div>
      </div>
      <div className='fixed bottom-10 right-10'>
        <button
          type='button'
          className='rounded-full bg-blue-400 p-2 transition-colors hover:bg-blue-700'
          onClick={() => dialogRef.current!.showModal()}
        >
          <PlusIcon className='h-10' />
        </button>
      </div>
      <dialog ref={dialogRef} onMouseDown={() => dialogRef.current!.close()} className='p-0'>
        <div onMouseDown={(e) => e.stopPropagation()}>
          <UploadLocation
            onSummitStart={(location: LocationForm) => {
              dialogRef.current!.close();
              setLocations([location, ...locations]);
            }}
          />
        </div>
      </dialog>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const result: LocationForm[] = await sanityClient.fetch<LocationForm[]>(`
    *[_type == "locations"] | order(_createdAt desc) [0..15]
  `);
  result.forEach((location: LocationForm) => {
    if ((location as any).previewImage) {
      location.image = urlFor((location as any).previewImage).url();
      return;
    }
    location.image = (location as any).previewUrl;
  });
  return {
    props: { _locations: result },
    revalidate: 3600,
  };
};
