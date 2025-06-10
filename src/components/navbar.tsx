"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [auth, setAuth] = useState<boolean>(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuth(!!token);
    console.log(token);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };
  return auth ? (
    <div className="flex items-center justify-end p-4">
      <button onClick={handleLogout}>Logout</button>
    </div>
  ) : (
    <div className="bg-white border-b border-neutral-200">
      {/* Desktop View */}
      <div className="hidden md:flex justify-between items-center px-6 py-4">
        <div className="font-bold text-xl">AEON</div>
        <div className="flex space-x-6 items-center">
          <Link href="#">Showcase</Link>
          <Link href="#">Docs</Link>
          <Link href="#">Blog</Link>
          <Link href="#">Analytics</Link>
          <Link href="#">Templates</Link>
          <Link href="#">Enterprise</Link>
          <input
            type="text"
            placeholder="Search documentation..."
            className="border px-2 py-1 rounded text-sm"
          />
          <Link
            href="/login"
            className="px-4 py-2 text-blue-600 hover:underline"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex justify-between items-center px-6 py-4">
        <div className="font-bold text-xl">AEON</div>
        <div className="flex items-center gap-4">
          <button>
            <Search size={24} />
          </button>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden px-6 py-2 border-t">
          <nav className="flex flex-col space-y-2">
            <Link href="#" className="hover:underline">
              Showcase
            </Link>
            <Link href="#" className="hover:underline">
              Docs
            </Link>
            <Link href="#" className="hover:underline">
              Blog
            </Link>
            <Link href="#" className="hover:underline">
              Analytics
            </Link>
            <Link href="#" className="hover:underline">
              Commerce
            </Link>
            <Link href="#" className="hover:underline">
              Templates
            </Link>
            <Link href="#" className="hover:underline">
              Enterprise
            </Link>
            <Link
              href="/challenge-2"
              className="mt-4 text-blue-600 hover:underline"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
