import { IntroHero } from "@/components/intro/IntroHero";
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <main>
        <IntroHero />
      </main>
    </>
  );
}