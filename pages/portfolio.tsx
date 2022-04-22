import Header from '../components/header';

export default function Portfolio() {
  return (
    <div>
      <Header />
      {/* Banner */}
      <div className="max-w-7xl mx-auto items-center bg-[url('https://cdn.sanity.io/images/pcxre08t/production/62245a2e98d0ade772bec206a56abd640ebf404a-1048x516.png')]" >
        <div className='backdrop-filter backdrop-blur-sm w-full h-full flex flex-col p-5 bg-white/30'>
          <div className='flex justify-between items-center'>
            <h1 className='text-5xl md:text-9xl pl-5'>Tom Lu</h1>

            <img className='h-32 md:h-96 rounded-full' src='https://scontent.fybz2-2.fna.fbcdn.net/v/t1.6435-9/86876126_2435478566715847_2876080414034755584_n.jpg?_nc_cat=106&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=BAzTr2LTTwwAX-eGltj&_nc_ht=scontent.fybz2-2.fna&oh=00_AT-I3L9hoewsE36F1AifIhKWuxpdCFmk5am3_Zf98noRGQ&oe=62877B5B' />
          </div>

          <p className='indent-8 text-gray-800 w-full p-2 md:px-16 md:py-4 md:w-2/3 md:text-2xl'>Hes a pretty cool guy. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
        </div>
      </div>
    </div >
  );
};