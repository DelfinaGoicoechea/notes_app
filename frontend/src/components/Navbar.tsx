import { NavLink } from "react-router-dom";

const getNavLinkClassName = ({ isActive }: {isActive: boolean}) => 
  isActive ? "text-black font-semibold underline" : "text-gray-700 hover:text-black transition";

export default function Navbar() {
  return (
    <nav className="border-b" aria-label="Main navigation">
      <div className="max-w-xl mx-auto flex gap-4 px-4 py-3 text-sm">
        <NavLink
          to="/"
          className={getNavLinkClassName}
        >
          Active Notes
        </NavLink>

        <NavLink
          to="/archived"
          className={getNavLinkClassName}
        >
          Archived Notes
        </NavLink>
      </div>
    </nav>
  );
}