import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import Diary from './pages/Diary.jsx'
import Notice from './pages/Notice.jsx'
import AI from './pages/AI.jsx'
import FreeBBS from './pages/FreeBBS.jsx'

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-full transition-colors ${
    isActive ? 'bg-amber/20 text-clay font-semibold' : 'hover:bg-amber/10'
  }`

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur bg-linen/80 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-clay">Heyso Diary</div>
          <nav className="flex gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Diary
            </NavLink>
            <NavLink to="/notice" className={navLinkClass}>
              Notice
            </NavLink>
            <NavLink to="/ai" className={navLinkClass}>
              AI
            </NavLink>
            <NavLink to="/freebbs" className={navLinkClass}>
              FreeBBS
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route index element={<Diary />} />
            <Route path="notice" element={<Notice />} />
            <Route path="ai" element={<AI />} />
            <Route path="freebbs" element={<FreeBBS />} />
          </Routes>
        </div>
      </main>

      <footer className="border-t border-sand/50">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-clay/70">
          © {new Date().getFullYear()} Heyso Diary
        </div>
      </footer>
    </div>
  )
}
