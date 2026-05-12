import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="max-w-xl mx-auto flex gap-4 px-4 py-3 text-sm">
        <NavLink
          to="/"
          className={({ isActive }) => 
            isActive ? "text-black font-semibold underline" : "text-gray-700 hover:text-black transition"
          }
        >
          Active Notes
        </NavLink>

        <NavLink
          to="/archived"
          className={({ isActive }) => 
            isActive ? "text-black font-semibold underline" : "text-gray-700 hover:text-black transition"
          }
        >
          Archived Notes
        </NavLink>
      </div>
    </nav>
  );
}