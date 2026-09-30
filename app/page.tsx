import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Approach from "@/components/sections/Approach";
import About from "@/components/sections/About";
import Systems from "@/components/sections/Systems";
import Work from "@/components/sections/Work";
import Dsa from "@/components/sections/Dsa";
import Training from "@/components/sections/Training";
import Life from "@/components/sections/Life";
import Contact from "@/components/sections/Contact";
import MotionDirector from "@/components/motion/MotionDirector";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Approach />
        <About />
        <Systems />
        <Work />
        <Dsa />
        <Training />
        <Life />
        <Contact />
      </main>
      <Footer />
      <div className="rope" data-rope aria-hidden="true">
        <span className="rope-swimmer" data-rope-swimmer />
      </div>
      <MotionDirector />
    </>
  );
}
