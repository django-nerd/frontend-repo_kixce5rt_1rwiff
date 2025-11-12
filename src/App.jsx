import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

function useApiBase() {
  return useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
}

function SocialIcon({ name }) {
  // Minimal built-in emoji fallback to avoid extra icon deps in UI
  const map = {
    github: '🐙',
    linkedin: '💼',
    twitter: '🐦',
    x: '🐦',
    globe: '🌐',
    dribbble: '🏀',
    behance: '🎨',
  }
  const k = (name || 'globe').toLowerCase()
  return <span className="mr-1">{map[k] || '🔗'}</span>
}

function ProjectTag({ label }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-black/5 text-black/70 dark:bg-white/10 dark:text-white/80">
      {label}
    </span>
  )
}

function ProjectCard({ project }) {
  return (
    <a
      href={project.link || '#'}
      target={project.link ? '_blank' : '_self'}
      rel="noreferrer"
      className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 backdrop-blur hover:shadow-xl transition-all hover:-translate-y-1"
    >
      {project.image_url ? (
        <img src={project.image_url} alt={project.title} className="h-48 w-full object-cover" />
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-indigo-100 to-sky-100" />
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {project.featured && (
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-900">Featured</span>
          )}
          {project.tags?.slice(0, 3).map((t, i) => (
            <ProjectTag key={i} label={t} />
          ))}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
      </div>
    </a>
  )
}

export default function App() {
  const baseUrl = useApiBase()
  const [portfolio, setPortfolio] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, prRes] = await Promise.all([
          fetch(`${baseUrl}/api/portfolio`),
          fetch(`${baseUrl}/api/projects`),
        ])
        const p = await pRes.json()
        const pr = await prRes.json()
        setPortfolio(p)
        setProjects(Array.isArray(pr) ? pr : [])
      } catch (e) {
        // graceful fallback
        setPortfolio({
          hero_title: "Hey, I'm Alex — Creative Developer",
          hero_subtitle: 'I build playful, interactive web experiences.',
          about: 'I love crafting modern, interactive interfaces that feel alive.',
          socials: [
            { label: 'GitHub', url: 'https://github.com/', icon: 'github' },
            { label: 'LinkedIn', url: 'https://linkedin.com/', icon: 'linkedin' },
          ],
        })
        setProjects([
          {
            title: 'Toybox UI',
            description: 'A playful component kit with physics.',
            tags: ['react', 'framer-motion'],
            featured: true,
            order: 1,
            link: '#',
          },
          {
            title: '3D Playground',
            description: 'WebGL experiments and microgames.',
            tags: ['threejs', 'spline'],
            order: 2,
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [baseUrl])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] via-[#0d1330] to-[#0e173d] text-white">
      {/* Hero with Spline scene */}
      <section className="relative h-[70vh] md:h-[80vh] w-full">
        <div className="absolute inset-0">
          <Spline
            scene="https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {/* Gradient overlay for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e173d] via-transparent to-transparent" />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex items-end pb-16">
          <div className="backdrop-blur-sm/0">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {portfolio?.hero_title || 'Interactive Portfolio'}
            </h1>
            <p className="mt-4 text-white/80 max-w-2xl">
              {portfolio?.hero_subtitle || 'Modern, playful, and tech-forward.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {portfolio?.socials?.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/15 text-sm"
                >
                  <SocialIcon name={s.icon} /> {s.label}
                </a>
              ))}
              <a
                href="/admin"
                className="ml-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/90 hover:bg-indigo-500 text-sm"
              >
                Admin Panel
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8">
          <h2 className="text-2xl font-bold">About</h2>
          <p className="mt-3 text-white/80 leading-relaxed">
            {portfolio?.about || 'This portfolio showcases a collection of interactive experiments and client work.'}
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Selected Work</h2>
          <a href="/test" className="text-sm text-white/70 hover:text-white">System Test</a>
        </div>
        {loading ? (
          <p className="text-white/70">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <ProjectCard key={p.id || i} project={p} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/60 text-sm">
        © {new Date().getFullYear()} • Built with love and a hint of play
      </footer>
    </div>
  )
}
