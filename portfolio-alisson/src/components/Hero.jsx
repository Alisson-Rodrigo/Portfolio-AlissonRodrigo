import React from 'react';
import bg from '../assets/images/72BAE291-6968-4F3B-B2C2-AF674B8800AE.png';

const Hero = () => {
  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-white py-32">
      <div className="w-full max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="text-center lg:text-left">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
            <span className="text-gray-300 font-light block">I'm a</span>
            <span className="text-black">Web Developer</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg">
            100% Html5 Bootstrap5 Templates Made By Growtech.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <a
              href="#get-started"
              className="px-6 py-3 border border-black text-black font-semibold rounded-full hover:bg-black hover:text-white transition"
            >
              GET STARTED
            </a>
            <a
              href="#portfolio"
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition"
            >
              VIEW PORTFOLIO
            </a>
          </div>
        </div>   
    </div>
    </section>
  );
};

export default Hero;