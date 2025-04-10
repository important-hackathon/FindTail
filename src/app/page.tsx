import Hero from '@/components/home/Hero';
import Find from '@/components/home/Find';
import Announce from '@/components/home/Announce';
import Donate from '@/components/home/Donate';

export default function HomePage() {
  return (
      <div>
        <Hero />
        <Find />
        <Announce />
        <Donate />
      </div>
  );
}
