"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { HiMenu, HiX } from "react-icons/hi";
import Button from "./Button";

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout, loading } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActive = (href) => pathname === href;

  const getLinkClass = (href) => {
    const baseClass = "transition-all duration-300 relative group";
    const activeClass = isActive(href)
      ? "text-green-primary"
      : "text-text-secondary hover:text-green-primary";
    return `${baseClass} ${activeClass}`;
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full glass border-b border-green-primary/20 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        <Link
          href="/"
          className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity"
        >
          ✨ UI Generator
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex gap-8 font-medium items-center">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={getLinkClass(item.href)}>
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-secondary to-green-primary transition-all duration-300 group-hover:w-full ${isActive(item.href) ? "w-full" : ""}`}
                  ></span>
                </Link>
              </li>
            ))}

            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <li>
                        <Link href="/admin" className={getLinkClass("/admin")}>
                          Admin
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        href="/user/projectHistory"
                        className={getLinkClass("/user/projectHistory")}
                      >
                        Projects
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/user/profile"
                        className={getLinkClass("/user/profile")}
                      >
                        {user?.name || "Profile"}
                      </Link>
                    </li>
                    <li>
                      <Button variant="danger" size="sm" onClick={handleLogout}>
                        Logout
                      </Button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/login" className={getLinkClass("/login")}>
                        Login
                      </Link>
                    </li>
                    <li>
                      <Button asChild variant="primary" size="sm">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-green-primary text-2xl"
        >
          {isOpen ? <HiX /> : <HiMenu />}
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <motion.nav
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden glass border-t border-green-primary/20"
      >
        <ul className="flex flex-col gap-4 p-6 font-medium">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={getLinkClass(item.href)}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {!loading && (
            <>
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <li>
                      <Link
                        href="/admin"
                        className={getLinkClass("/admin")}
                        onClick={() => setIsOpen(false)}
                      >
                        Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/user/projectHistory"
                      className={getLinkClass("/user/projectHistory")}
                      onClick={() => setIsOpen(false)}
                    >
                      Projects
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/user/profile"
                      className={getLinkClass("/user/profile")}
                      onClick={() => setIsOpen(false)}
                    >
                      {user?.name || "Profile"}
                    </Link>
                  </li>
                  <li>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full"
                    >
                      Logout
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                  </li>
                  <li>
                    <Button
                      asChild
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
      </motion.nav>
    </header>
  );
};

export default Header;
