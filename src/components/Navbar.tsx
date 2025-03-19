"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";

// Define section types for type safety
type Section =
  | "home"
  | "selection"
  | "currentBenefits"
  | "userInput"
  | "suggestBenefits"
  | "end";

type NavbarProps = {
  navigateTo?: (section: Section) => void;
};

const Navbar = ({ navigateTo }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle navigation when using single page app
  const handleNavigation = (section: string) => {
    if (navigateTo) {
      navigateTo(section as Section);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {navigateTo ? (
              <button
                onClick={() => handleNavigation("home")}
                className="flex-shrink-0 flex items-center"
              >
                <span className="text-2xl font-bold gradient-text">
                  ประกันสังคมเพื่อเรา
                </span>
              </button>
            ) : (
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold gradient-text">
                  ประกันสังคมเพื่อเรา
                </span>
              </Link>
            )}
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navigateTo ? (
              <>
                <button
                  onClick={() => handleNavigation("home")}
                  className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                >
                  หน้าหลัก
                </button>
                <button
                  onClick={() => handleNavigation("selection")}
                  className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                >
                  ค้นหาประเภท
                </button>
                <button
                  onClick={() => handleNavigation("currentBenefits")}
                  className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                >
                  สิทธิประโยชน์ปัจจุบัน
                </button>
                <button
                  onClick={() => handleNavigation("suggestBenefits")}
                  className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
                >
                  เสนอสิทธิประโยชน์
                </button>
                <button
                  onClick={() => handleNavigation("selection")}
                  className="btn-primary ml-4 cursor-pointer"
                >
                  เริ่มที่นี่
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  หน้าหลัก
                </Link>
                <Link
                  href="/selection"
                  className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  ค้นหาประเภท
                </Link>
                <Link
                  href="/currentBenefits"
                  className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  สิทธิประโยชน์ปัจจุบัน
                </Link>
                <Link
                  href="/suggestBenefits"
                  className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  เสนอสิทธิประโยชน์
                </Link>
                <Link href="/" className="btn-primary ml-4">
                  เริ่มที่นี่
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-md text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigateTo ? (
              <>
                <button
                  onClick={() => handleNavigation("home")}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:text-primary cursor-pointer"
                >
                  หน้าหลัก
                </button>
                <button
                  onClick={() => handleNavigation("selection")}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:text-primary cursor-pointer"
                >
                  ค้นหาประเภท
                </button>
                <button
                  onClick={() => handleNavigation("currentBenefits")}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:text-primary cursor-pointer"
                >
                  สิทธิประโยชน์ปัจจุบัน
                </button>
                <button
                  onClick={() => handleNavigation("suggestBenefits")}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:text-primary cursor-pointer"
                >
                  เสนอสิทธิประโยชน์
                </button>
                <button
                  onClick={() => handleNavigation("selection")}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-primary text-white cursor-pointer"
                >
                  เริ่มที่นี่
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  หน้าหลัก
                </Link>
                <Link
                  href="/selection"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ค้นหาประเภท
                </Link>
                <Link
                  href="/currentBenefits"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  สิทธิประโยชน์ปัจจุบัน
                </Link>
                <Link
                  href="/suggestBenefits"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  เสนอสิทธิประโยชน์
                </Link>
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  เริ่มที่นี่
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
