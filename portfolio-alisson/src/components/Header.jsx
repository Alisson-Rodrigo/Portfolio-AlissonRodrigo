// src/components/Header.jsx
import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 shadow-md bg-transparent">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800">
          <span className="text-white">Aliss</span>
          <span className="text-purple-600">=</span>
          <span className="text-white">on</span>
        </div>

        {/* Menu de navegação (desktop) */}
        <nav className="hidden lg:flex space-x-6 text-gray-600 font-medium text-sm">
          <a href="#hero" className=" hover:text-purple-600 transition">Início</a>
          <a href="#about" className="hover:text-purple-600 transition">Sobre</a>
          <a href="#about" className="hover:text-purple-600 transition">Serviços</a>
          <a href="#about" className="hover:text-purple-600 transition">Feedback</a>
          <a href="#about" className="hover:text-purple-600 transition">Experiência</a>
          <a href="#contact" className="hover:text-purple-600 transition">Contate-me</a>
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
            className="menu menu-sm dropdown-content mt-3 z-[1] p-4 shadow bg-white rounded-box w-56 text-sm text-gray-700"
          >
            <li><a href="#hero">Início</a></li>
            <li><a href="#about">Sobre</a></li>
            <li><a href="#about">Serviços</a></li>
            <li><a href="#about">Feedback</a></li>
            <li><a href="#about">Experiência</a></li>
            <li><a href="#contact">Contate-me</a></li>
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
