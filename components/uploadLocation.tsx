import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LocationForm } from '../shared/location';
import { ClipboardCheckIcon } from '@heroicons/react/outline';
import { toast } from 'react-toastify';

interface UploadLocationProps {
  onSummitStart?: (location: LocationForm) => void;
  onSummitEnd?: () => void;
}

export default function UploadLocation({ onSummitStart, onSummitEnd }: UploadLocationProps) {
  const { register, handleSubmit, watch, setValue, reset } = useForm<LocationForm>();
  watch();
  const [file, setFile] = useState<File | undefined>(undefined);
  const inputImageRef = useRef<HTMLInputElement>(null);

  const pasteUrl = async () => {
    let text = await navigator.clipboard.readText();
    if (text.includes('goo.gl/maps')) {
      text = await (
        await fetch('/api/location/unshorten', {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ url: text }),
        })
      ).text();
    }
    if (text.includes('google')) {
      setValue('location', decodeURIComponent(text.split('/')[5].replace(/\+/g, ' ')));
    }
    setValue('googleMapsUrl', text);
  };

  const getClipboardImage = async () => {
    const image = (await navigator.clipboard.read())[0];
    let imageBlob;
    for (const type of image.types) {
      if (type.toLocaleLowerCase().includes('image')) {
        imageBlob = await image.getType(type);
      }
    }
    if (imageBlob) {
      const file = new File([imageBlob], `unknown.${imageBlob.type.split('/')[1]}`, {
        type: imageBlob.type,
      });
      setFile(file);
      toast('go your image');
    }
  };

  const onSubmit = async (data: LocationForm) => {
    if (onSummitStart) {
      console.log(data);
      onSummitStart({
        ...data,
        image: file,
      });
    }
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (key === 'image') {
        formData.append('image', file as Blob);
        continue;
      }
      formData.append(key, value as string | Blob);
    }

    const res = await fetch('api/location', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      toast('saved!', { type: 'success' });
      setFile(undefined);
      reset();
    }
  };

  return (
    <div className='flex flex-row justify-between bg-slate-100'>
      {/* <button
        onClick={() =>
          toast('Toast is good', {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'success',
          })
        }
      >
        toast
      </button> */}
      <form onSubmit={handleSubmit(onSubmit)} className='m-4 flex max-w-[50rem] flex-col gap-4 rounded-lg bg-white p-2'>
        <div>
          <label className='ml-2 mb-2 block text-lg font-bold text-gray-700' htmlFor='username'>
            Location:
          </label>
          <input
            className='w-full rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none'
            id='username'
            type='text'
            placeholder='Location Name'
            {...register('location')}
          />
        </div>
        <div>
          <label className='mb-2 block text-lg font-bold text-gray-700' htmlFor='username'>
            Google Maps Url:
          </label>
          <div className='flex flex-row'>
            <input
              className='w-0 flex-grow rounded-l border-t border-l border-b py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none'
              id='username'
              type='text'
              placeholder='Google Maps Url'
              {...register('googleMapsUrl')}
              onPaste={pasteUrl}
            />
            <button
              className='rounded-r border-t border-r border-b bg-gray-100 px-2 shadow'
              type='button'
              onClick={pasteUrl}
            >
              clipboard
            </button>
          </div>
        </div>
        <div>
          <label className='mb-2 block text-lg font-bold text-gray-700' htmlFor='region'>
            Region:
          </label>
          <input
            className='w-full flex-grow rounded border-t border-l border-b py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none'
            id='region'
            type='text'
            placeholder='Region'
            {...register('region')}
          />
        </div>
        <div className='flex gap-4'>
          <div className='w-1/2'>
            <label className='mb-2 block text-lg font-bold text-gray-700' htmlFor='region'>
              Pre notes
            </label>
            <textarea
              className='w-full focus:outline-none'
              {...register('preNotes')}
              rows={5}
              placeholder='Pre notes'
            />
          </div>
          <div className='w-1/2'>
            <label className='mb-2 block text-lg font-bold text-gray-700' htmlFor='region'>
              Post notes
            </label>
            <textarea
              className='w-full focus:outline-none'
              {...register('postNotes')}
              rows={5}
              placeholder='Post notes'
            />
          </div>
        </div>
        <div className='flex flex-col items-center gap-4 md:flex-row md:gap-2'>
          <input
            className='w-52 cursor-pointer border-gray-300 border-transparent bg-gray-100 text-gray-900'
            type='file'
            {...register('image')}
            onChange={(event: any) => {
              console.log(event.target.files[0]);
              setFile(event.target.files[0]);
            }}
            ref={inputImageRef}
          />
          <div className='flex flex-row gap-2'>
            <button
              className='round flex flex-row bg-gray-100 py-1 px-2 shadow'
              type='button'
              onClick={getClipboardImage}
            >
              clipboard
              <div className='h-4 w-4'>
                <ClipboardCheckIcon />
              </div>
            </button>
            <button type='submit' className='round bg-gray-100  py-1 px-2 shadow'>
              Add Location
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
