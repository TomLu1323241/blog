import Header from '../components/header';

export default function Home() {
  return (
    <div>
      <Header />
      {/* Banner */}
      <div className='flex justify-between p-5 max-w-7xl mx-auto items-center'>
        <div>
          <h1 className='text-9xl'>Tom Lu</h1>
          <p>Hes a pretty cool guy</p>
        </div>
        <img className='h-96 rounded-full' src='https://scontent.fybz2-2.fna.fbcdn.net/v/t1.6435-9/86876126_2435478566715847_2876080414034755584_n.jpg?_nc_cat=106&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=BAzTr2LTTwwAX-eGltj&_nc_ht=scontent.fybz2-2.fna&oh=00_AT-I3L9hoewsE36F1AifIhKWuxpdCFmk5am3_Zf98noRGQ&oe=62877B5B' />
      </div>
    </div>
  );
};