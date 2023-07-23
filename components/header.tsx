import { useTheme } from 'next-themes';
import Link from 'next/link';
import { MoonIcon, SunIcon } from '@heroicons/react/solid';
import { useEffect, useState } from 'react';

function Header() {
  const { systemTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const renderThemeChanger = () => {
    if (!mounted) {
      return;
    }
    const currentTheme = theme === 'system' ? systemTheme : theme;
    if (currentTheme === 'dark') {
      return <SunIcon className='h-8 text-yellow-300' onClick={() => setTheme('light')} />;
    } else {
      return <MoonIcon className='h-8 text-gray-700' onClick={() => setTheme('dark')} />;
    }
  };

  return (
    <header className='mx-auto flex max-w-7xl justify-between p-5'>
      <div className='flex items-center'>
        <Link href='/' passHref>
          <a>
            <img
              className='hidden w-44 cursor-pointer object-contain dark:invert md:inline-block'
              src='/logo long.png'
              alt=''
            />
            <img
              className='inline-block h-12 cursor-pointer object-contain dark:invert md:hidden'
              src='/logo.png'
              alt=''
            />
          </a>
        </Link>
        <h3 className='ml-1 rounded-full bg-blue-600 px-4 py-1 text-white md:ml-4'>
          <Link href='/media' passHref>
            <a>Media</a>
          </Link>
        </h3>
      </div>

      <div className='flex flex-row items-center justify-center text-green-600'>
        <Link href='/sub-to-email' passHref>
          <a>
            <h3 className='mr-1 rounded-full border border-green-600 px-2 py-1 text-center hover:bg-green-600  hover:text-white md:mr-4 md:px-4'>
              Subscribe with email
            </h3>
          </a>
        </Link>
        {renderThemeChanger()}
      </div>
    </header>
  );
}

export default Header;
