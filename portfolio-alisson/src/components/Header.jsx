import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 shadow-md bg-transparent">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800">
          <span className="text-black">Aliss</span>
          <span className="text-purple-600">=</span>
          <span className="text-black">on.</span>
        </div>

        {/* Menu de navegação (desktop) */}
        <nav className="hidden lg:flex space-x-6 text-gray-600 text-xl">
          {["Início", "Sobre", "Serviços", "Feedback", "Experiência", "Contate-me"].map((text, i) => (
            <a
              key={i}
              href={`#${text.toLowerCase()}`}
              className="relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-purple-600 after:transition-all after:duration-600 hover:after:w-full hover:text-purple-600"
            >
              {text}
            </a>
          ))}
        </nav>


        {/* Botão de ação */}
        <div className="hidden lg:block">
          <a 
            href="#contact" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition"
          >
            DOWNLOAD CV
          </a>
        </div>
        

        {/* Menu mobile (hambúrguer) */}
        <div className="lg:hidden dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" 
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <ul 
            tabIndex={0} 
            className="menu menu-md dropdown-content mt-3 z-[1] p-4 shadow bg-white  rounded-box w-56 text-sm text-gray-700"
          >
            <li><a className='hover:bg-purple-100' href="#hero">Início</a></li>
            <li><a className='hover:bg-purple-100' href="#about">Sobre</a></li>
            <li><a className='hover:bg-purple-100' href="#about">Serviços</a></li>
            <li><a className='hover:bg-purple-100' href="#about">Feedback</a></li>
            <li><a className='hover:bg-purple-100' href="#about">Experiência</a></li>
            <li><a className='hover:bg-purple-100' href="#contact">Contate-me</a></li>
            <li>
              <a 
                href="#contact" 
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-center"
              >
                DOWNLOAD CV
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
