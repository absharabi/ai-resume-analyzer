import { Link } from 'react-router'
import { useTheme } from "~/lib/useTheme";

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">Resumind</p> 
        </Link> 
    <div className="flex items-center gap-3">
      <Link to="/upload" className=" primary-button w-fit">
        Upload Resume
      </Link>
      <button
        type="button"
        onClick={toggleTheme}
        className="px-3 py-2 rounded-full border border-gray-200 text-sm font-medium bg-white hover:shadow transition"
        aria-label="Toggle color theme"
      >
        {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </div>
 </nav>
  )
}

export default Navbar