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

      <div className='flex items-center'>
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
        <h3 className='text-white bg-blue-600 ml-1 md:ml-4 px-4 py-1 rounded-full'>
          <Link href='/media' passHref><a>Media</a></Link>
        </h3>
      </div>

      <div className='flex flex-row justify-center items-center text-green-600'>
        <Link href='/sub-to-email' passHref>
          <a>
            <h3 className='border mr-1 md:mr-4 px-2 md:px-4 py-1 rounded-full border-green-600  hover:bg-green-600 hover:text-white text-center'>Subscribe with email</h3>
          </a>
        </Link>
        {renderThemeChanger()}
      </div>

    </header>
  );
}

export default Header;