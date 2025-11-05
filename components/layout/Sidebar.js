"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "react-icons/fi";

import { FiTrendingDown } from "react-icons/fi";

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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-dark text-white min-h-screen p-4 hidden md:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Billing App</h1>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href === "/" && pathname === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group",
                isActive
                  ? "bg-primary text-white shadow-lg transform scale-[1.02]"
                  : "text-light hover:bg-accent hover:text-white hover:shadow-md"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="font-medium">{item.label}</span>
              {item.highlight && (
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-75"></span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
