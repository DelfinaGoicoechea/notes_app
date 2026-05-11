import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="max-w-xl mx-auto flex gap-4 px-4 py-3 text-sm">
        <Link
          to="/"
          className="text-gray-700 hover:text-black transition"
        >
          Active Notes
        </Link>

        <Link
          to="/archived"
          className="text-gray-700 hover:text-black transition"
        >
          Archived Notes
        </Link>
      </div>
    </nav>
  );
}