import { NavLink } from "react-router-dom";

const getNavLinkClassName = ({ isActive }: {isActive: boolean}) => 
  [
    isActive ? "text-black font-semibold underline" : "text-gray-700 hover:text-black transition",
    "rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2",
  ].join(" ");

export default function Navbar() {
  return (
    <nav className="border-b" aria-label="Main navigation">
      <div className="max-w-xl mx-auto flex gap-4 px-4 py-3 text-sm">
        <NavLink
          to="/"
          id="nav-active-notes"
          className={getNavLinkClassName}
        >
          Active Notes
        </NavLink>

        <NavLink
          to="/archived"
          id="nav-archived-notes"
          className={getNavLinkClassName}
        >
          Archived Notes
        </NavLink>
      </div>
    </nav>
  );
}