import { useEffect, useMemo, useState } from 'react'

function useApiBase() {
  return useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
}

function Input({ label, className = '', ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-white/80">{label}</span>
      <input
        {...props}
        className={`mt-1 w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${className}`}
      />
    </label>
  )
}

function Textarea({ label, className = '', ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-white/80">{label}</span>
      <textarea
        {...props}
        className={`mt-1 w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${className}`}
      />
    </label>
  )
}

export default function AdminPanel() {
  const baseUrl = useApiBase()
  const [portfolio, setPortfolio] = useState({ hero_title: '', hero_subtitle: '', about: '', socials: [] })
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, prRes] = await Promise.all([
          fetch(`${baseUrl}/api/portfolio`),
          fetch(`${baseUrl}/api/projects`)
        ])
        setPortfolio(await pRes.json())
        setProjects(await prRes.json())
      } catch (e) {
        // ignore
      }
    }
    load()
  }, [baseUrl])

  const savePortfolio = async (e) => {
    e.preventDefault()
    setStatus('Saving...')
    const res = await fetch(`${baseUrl}/api/admin/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hero_title: portfolio.hero_title,
        hero_subtitle: portfolio.hero_subtitle,
        about: portfolio.about,
        socials: portfolio.socials || []
      })
    })
    setStatus(res.ok ? 'Saved!' : 'Failed to save')
    setTimeout(() => setStatus(''), 1500)
  }

  const addProject = async (e) => {
    e.preventDefault()
    const form = e.target
    const payload = {
      title: form.title.value,
      description: form.description.value,
      tags: form.tags.value.split(',').map(t => t.trim()).filter(Boolean),
      image_url: form.image_url.value || null,
      link: form.link.value || null,
      featured: form.featured.checked,
      order: Number(form.order.value || 0)
    }
    setStatus('Creating project...')
    const res = await fetch(`${baseUrl}/api/admin/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      setStatus('Project created')
      form.reset()
      const refreshed = await fetch(`${baseUrl}/api/projects`).then(r => r.json())
      setProjects(refreshed)
    } else {
      setStatus('Failed to create project')
    }
    setTimeout(() => setStatus(''), 1500)
  }

  const removeProject = async (id) => {
    setStatus('Deleting...')
    const res = await fetch(`${baseUrl}/api/admin/projects/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProjects(projects.filter(p => p.id !== id))
      setStatus('Deleted')
    } else {
      setStatus('Failed to delete')
    }
    setTimeout(() => setStatus(''), 1200)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] via-[#0d1330] to-[#0e173d] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Admin Panel</h1>
          <a href="/" className="text-white/70 hover:text-white">Back to site</a>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Portfolio editor */}
          <form onSubmit={savePortfolio} className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
            <h2 className="text-xl font-semibold">Portfolio Content</h2>
            <Input label="Hero Title" value={portfolio.hero_title || ''} onChange={(e) => setPortfolio(p => ({ ...p, hero_title: e.target.value }))} placeholder="Hey, I'm Alex — Creative Developer" />
            <Input label="Hero Subtitle" value={portfolio.hero_subtitle || ''} onChange={(e) => setPortfolio(p => ({ ...p, hero_subtitle: e.target.value }))} placeholder="I build playful, interactive web experiences." />
            <Textarea label="About" rows={5} value={portfolio.about || ''} onChange={(e) => setPortfolio(p => ({ ...p, about: e.target.value }))} />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Social Links</span>
                <button type="button" onClick={() => setPortfolio(p => ({ ...p, socials: [...(p.socials || []), { label: '', url: '', icon: 'globe' }] }))} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">Add</button>
              </div>
              <div className="space-y-3">
                {(portfolio.socials || []).map((s, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <Input label="Label" value={s.label || ''} onChange={(e) => setPortfolio(p => { const arr = [...(p.socials||[])]; arr[i] = { ...arr[i], label: e.target.value }; return { ...p, socials: arr } })} placeholder="GitHub" />
                    <Input label="URL" value={s.url || ''} onChange={(e) => setPortfolio(p => { const arr = [...(p.socials||[])]; arr[i] = { ...arr[i], url: e.target.value }; return { ...p, socials: arr } })} placeholder="https://github.com/you" />
                    <Input label="Icon" value={s.icon || ''} onChange={(e) => setPortfolio(p => { const arr = [...(p.socials||[])]; arr[i] = { ...arr[i], icon: e.target.value }; return { ...p, socials: arr } })} placeholder="github" />
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-2 inline-flex items-center px-4 py-2 rounded bg-indigo-500/90 hover:bg-indigo-500">Save</button>
          </form>

          {/* Project creator and list */}
          <div className="space-y-6">
            <form onSubmit={addProject} className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
              <h2 className="text-xl font-semibold">Add Project</h2>
              <Input name="title" label="Title" placeholder="Project title" required />
              <Textarea name="description" label="Description" rows={3} placeholder="Short description" />
              <Input name="tags" label="Tags (comma separated)" placeholder="react, threejs" />
              <Input name="image_url" label="Image URL" placeholder="https://..." />
              <Input name="link" label="External Link" placeholder="https://..." />
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" name="featured" className="rounded border-white/20 bg-white/10" />
                  Featured
                </label>
                <Input name="order" label="Order" type="number" defaultValue={0} />
              </div>
              <button className="inline-flex items-center px-4 py-2 rounded bg-emerald-500/90 hover:bg-emerald-500">Create</button>
            </form>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4">Projects</h2>
              <div className="space-y-3">
                {projects.length === 0 && <p className="text-white/60 text-sm">No projects yet.</p>}
                {projects.map((p, idx) => (
                  <div key={p.id || idx} className="flex items-center justify-between rounded-lg bg-black/20 px-4 py-3">
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-sm text-white/60">{(p.tags || []).join(', ')}</p>
                    </div>
                    {p.id && (
                      <button onClick={() => removeProject(p.id)} className="text-red-300 hover:text-red-200">Delete</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {status && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 backdrop-blur px-4 py-2 text-sm">{status}</div>}
      </div>
    </div>
  )
}
