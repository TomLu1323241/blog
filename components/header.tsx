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
    <header className='flex justify-between p-5 max-w-7xl mx-auto'>

      <div className='flex items-center space-x-5'>
        <Link href='/' passHref>
          <a>
            <img
              className='w-44 object-contain cursor-pointer hidden md:inline-block dark:invert'
              src='/logo long.png'
              alt=''
            />
            <img
              className='h-12 object-contain cursor-pointer inline-block md:hidden dark:invert'
              src='/logo.png'
              alt=''
            />
          </a>
        </Link>
        <div className='hidden md:inline-flex items-center space-x-5'>
          <h3>About</h3>
          <h3>Contact</h3>
          <h3 className='text-white bg-green-600 px-4 py-1 rounded-full'>Follow</h3>
        </div>
      </div>

      <div className='flex flex-row justify-center items-center space-x-5 text-green-600'>
        <Link href='/sub-to-email' passHref>
          <a>
            <h3 className='border px-2 md:px-4 py-1 rounded-full border-green-600 mx-auto: hover:bg-green-600 hover:text-white text-center'>Subscribe with email</h3>
          </a>
        </Link>
        {renderThemeChanger()}
      </div>

    </header>
  );
}

export default Header;