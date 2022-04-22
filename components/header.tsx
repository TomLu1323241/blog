import Link from 'next/link';

function Header() {
  return (
    <header className='flex justify-between p-5 max-w-7xl mx-auto'>

      <div className='flex items-center space-x-5'>
        <Link href='/' passHref>
          <img
            className='w-44 object-contain cursor-pointer'
            src='/logo long.png'
            alt=''
          />
        </Link>
        <div className='hidden md:inline-flex items-center space-x-5'>
          <h3>About</h3>
          <h3>Contact</h3>
          <h3 className='text-white bg-green-600 px-4 py-1 rounded-full'>Follow</h3>
        </div>
      </div>

      <div className='flex flex-col justify-center md:flex-row md:items-center md:space-x-5 text-green-600 '>
        <h3 className='px-4 py-1 mx-auto'>Sign In</h3>
        <h3 className='border px-4 py-1 rounded-full border-green-600 mx-auto'>Get Started</h3>
      </div>

    </header>
  );
}

export default Header;