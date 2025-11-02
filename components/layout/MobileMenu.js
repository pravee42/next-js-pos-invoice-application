"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiX } from "react-icons/fi";
import { cn } from "../../lib/utils";
import {
  FiHome,
  FiPackage,
  FiUsers,
  FiUser,
  FiFileText,
  FiDollarSign,
  FiEdit,
  FiBarChart2,
  FiSettings,
  FiTrendingDown,
} from "react-icons/fi";

const menuItems = [
  { icon: FiHome, label: "Dashboard", href: "/" },
  { icon: FiDollarSign, label: "Sale", href: "/sale", highlight: true },
  { icon: FiFileText, label: "Invoices", href: "/invoices" },
  { icon: FiEdit, label: "Quotations", href: "/quotation" },
  { icon: FiPackage, label: "Products", href: "/products" },
  { icon: FiUsers, label: "Customers", href: "/customers" },
  { icon: FiUser, label: "Employees", href: "/employees" },
  { icon: FiTrendingDown, label: "Expenses", href: "/expenses" },
  { icon: FiBarChart2, label: "Reports", href: "/reports" },
  { icon: FiSettings, label: "Settings", href: "/settings" },
];

export default function MobileMenu({ isOpen, onClose }) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-64 bg-dark text-white shadow-xl">
        <div className="p-4 border-b border-accent">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary">Billing App</h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href === "/" && pathname === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative",
                  isActive
                    ? "bg-primary text-white shadow-lg"
                    : "text-light hover:bg-accent hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.highlight && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-75"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
