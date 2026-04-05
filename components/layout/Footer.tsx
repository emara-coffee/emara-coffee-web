'use client';

import Link from 'next/link';
import Image from 'next/image';

// MUI Icons
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArticleIcon from '@mui/icons-material/Article';
import SyncIcon from '@mui/icons-material/Sync';

export default function Footer() {
  return (
    <footer className="w-full bg-[#2A1608]">
      <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <Image 
                  src="/logo.png" 
                  alt="Emara Coffee Logo" 
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>
              <span className="font-bold text-xl text-white tracking-tight uppercase">
                Emara Coffee
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Sourcing the finest specialty coffee from plantations in Kenya, Uganda, Ethiopia, and Rwanda. Bringing the heart of Africa to your cup.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/emaracoffee" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#4A7C59] transition-transform hover:scale-110">
                <FacebookIcon fontSize="small" />
              </a>
              <a href="https://twitter.com/emaracoffee" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#4A7C59] transition-transform hover:scale-110">
                <TwitterIcon fontSize="small" />
              </a>
              <a href="https://instagram.com/emaracoffee" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#4A7C59] transition-transform hover:scale-110">
                <InstagramIcon fontSize="small" />
              </a>
            </div>
          </div>

          {/* Shop Collections */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <VerifiedUserIcon fontSize="small" className="text-[#4A7C59]" /> Shop Collections
            </h3>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-gray-400 hover:text-[#4A7C59] text-sm transition-colors">Kenya AA Premium</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-[#4A7C59] text-sm transition-colors">Uganda Robusta</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-[#4A7C59] text-sm transition-colors">Ethiopian Yirgacheffe</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-[#4A7C59] text-sm transition-colors">Rwanda Highland</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <ArticleIcon fontSize="small" className="text-[#4A7C59]" /> Company & Legal
            </h3>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms & Conditions</Link></li>
              <li>
                <Link href="/refund-policy" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <SyncIcon fontSize="inherit" /> Refund Policy
                </Link>
              </li>
              <li><Link href="/track-order" className="text-gray-400 hover:text-white text-sm transition-colors">Shipping Information</Link></li>
              <li><Link href="/tickets" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-6">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe for plantation stories and coffee exchange market updates.
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-[#1A0D05] border border-gray-800 text-white px-4 py-3 rounded-md focus:outline-none focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59] text-sm transition-all"
              />
              <button
                type="submit"
                className="bg-[#4A7C59] text-white font-semibold py-3 rounded-md hover:bg-[#3A5A40] transition-colors text-sm"
              >
                Join the Community
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">
            © {new Date().getFullYear()} Emara Coffee Plantation. All rights reserved. Registered in Kenya & Uganda.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-gray-500 hover:text-white text-xs transition-colors">Terms</Link>
            <Link href="/refund-policy" className="text-gray-500 hover:text-white text-xs transition-colors">Refunds</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-white text-xs transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}