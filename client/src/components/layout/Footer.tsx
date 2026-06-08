'use client';

import Link from 'next/link';
import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
                AI
              </div>
              <span className="font-bold text-white text-lg">MockMind</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered mock interviews to help you ace your next job opportunity.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors duration-200 hover:scale-110 transform"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors duration-200 hover:scale-110 transform"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:support@mockmind.ai"
                className="text-slate-400 hover:text-cyan-400 transition-colors duration-200 hover:scale-110 transform"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Home
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  About
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Features
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Pricing
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Documentation
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Blog
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  FAQ
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Support
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Privacy Policy
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Terms of Service
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Cookie Policy
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-1 group"
                >
                  Contact
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} MockMind. All rights reserved. Built with <span className="text-red-400">❤️</span> for job seekers.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors duration-200"
            >
              Status
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="#"
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors duration-200"
            >
              Changelog
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
