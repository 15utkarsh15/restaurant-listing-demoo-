import React, { useEffect, useState, useRef } from 'react'

type Restaurant = {
  id: string
  name: string
  cuisine: string
  rating: number
  costForTwo: number
  deliveryTimeMin: number
}

export default function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [search, setSearch] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'delivery' | 'cost'>('relevance')
  const [loading, setLoading] = useState(false)
  const [allCuisines, setAllCuisines] = useState<string[]>([])
  const debounceRef = useRef<number | undefined>(undefined)
  const [showMenuFor, setShowMenuFor] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<{id:string;name:string;price:number;desc?:string}[]>([])
  const [savedFavorites, setSavedFavorites] = useState<string[]>([])
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null)
  const [showFavoritesPanel, setShowFavoritesPanel] = useState(false)
  const [favoritesData, setFavoritesData] = useState<Restaurant[]>([])

  // Load restaurant list when filters change, with a small debounce for search
  useEffect(() => {
    setLoading(true)
    window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      const q = new URLSearchParams()
      if (search) q.set('search', search)
      if (cuisine) q.set('cuisine', cuisine)
      if (minRating) q.set('minRating', String(minRating))

      fetch(`http://localhost:4000/api/restaurants?${q.toString()}`)
        .then(res => res.json())
        .then(data => setRestaurants(data))
        .catch(err => {
          console.error(err)
          setRestaurants([])
        })
        .finally(() => setLoading(false))
    }, 300)
  }, [search, cuisine, minRating])

  // Load all cuisines on mount (so the cuisine dropdown feels complete)
  useEffect(() => {
    fetch('http://localhost:4000/api/restaurants')
      .then(res => res.json())
      .then((data: Restaurant[]) => {
        const uniq = Array.from(new Set(data.map(r => r.cuisine)))
        setAllCuisines(uniq)
      })
      .catch(() => setAllCuisines([]))
  }, [])

  // load saved favorites on mount
  useEffect(() => {
    fetch('http://localhost:4000/api/restaurants/favorites/list')
      .then(res => res.json())
      .then((data: Restaurant[]) => setSavedFavorites(data.map(d => d.id)))
      .catch(() => setSavedFavorites([]))
  }, [])

  function openMenu(id: string) {
    setLoading(true)
    fetch(`http://localhost:4000/api/restaurants/${id}`)
      .then(res => res.json())
      .then((data: any) => {
        setShowMenuFor(data)
        setMenuItems(data.menu || [])
        setToast({ type: 'success', message: `Loaded menu for ${data.name}` })
        window.setTimeout(() => setToast(null), 2500)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  function saveFavorite(id: string) {
    fetch('http://localhost:4000/api/restaurants/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
      .then(res => res.json())
      .then((data: any) => {
        if (data && data.favorites) setSavedFavorites(data.favorites)
        setToast({ type: 'success', message: 'Saved to favorites' })
        window.setTimeout(() => setToast(null), 1800)
      })
      .catch(err => { console.error(err); setToast({ type: 'error', message: 'Failed to save favorite' }); window.setTimeout(() => setToast(null), 2500) })
  }

  function loadFavorites() {
    fetch('http://localhost:4000/api/restaurants/favorites/list')
      .then(res => res.json())
      .then((data: Restaurant[]) => setFavoritesData(data))
      .catch(err => { console.error(err); setToast({ type: 'error', message: 'Failed to load favorites' }); window.setTimeout(() => setToast(null), 2000) })
  }

  const cuisines = allCuisines.length ? allCuisines : Array.from(new Set(restaurants.map(r => r.cuisine)))

  // Use picsum.photos with a seed per restaurant id to provide reliable,
  // attractive placeholder images. Picsum supports seeded images so each
  // restaurant keeps a consistent image across reloads.
  // Use local SVG images in `public/images/` as the primary source.
  // Keep a small fallback map just in case a local file is missing.
  const imageMap: Record<string, string> = {
    r1: '/images/r1.svg',
    r2: '/images/r2.svg',
    r3: '/images/r3.svg',
    r4: '/images/r4.svg',
    r5: '/images/r5.svg'
  }

  // Apply sorting for a nicer demo presentation
  const displayedRestaurants = React.useMemo(() => {
    const list = [...restaurants]
    switch (sortBy) {
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating)
      case 'delivery':
        return list.sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin)
      case 'cost':
        return list.sort((a, b) => a.costForTwo - b.costForTwo)
      default:
        return list
    }
  }, [restaurants, sortBy])

  return (
    <div className="app">
      <header className="hero">
        <div>
          <h1>Discover great food near you</h1>
          <p className="subtitle">Live search, filters, and quick previews.</p>
        </div>
        <div className="header-actions">
          <button className="ghost" onClick={() => { setShowFavoritesPanel(s => { const next = !s; if (next) loadFavorites(); return next }) }}>
            Favorites ({savedFavorites.length})
          </button>
        </div>
      </header>

      <section className="controls">
        <input aria-label="Search restaurants" placeholder="Search restaurants or cuisines (e.g. 'pizza')" value={search} onChange={e => setSearch(e.target.value)} />
        <select aria-label="Filter by cuisine" value={cuisine} onChange={e => setCuisine(e.target.value)}>
          <option value="">All cuisines</option>
          {cuisines.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="sort">
          Sort by
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="relevance">Relevance</option>
            <option value="rating">Top rated</option>
            <option value="delivery">Fastest</option>
            <option value="cost">Lowest cost</option>
          </select>
        </label>
        <label className="rating">
          Min Rating
          <input aria-label="Minimum rating" type="number" step="0.1" min={0} max={5} value={minRating || ''} onChange={e => setMinRating(Number(e.target.value) || 0)} />
        </label>
      </section>

      <section className="list">
        {loading ? (
          <div className="empty">Loading restaurants…</div>
        ) : restaurants.length === 0 ? (
          <div className="empty">No restaurants match your filters. Try clearing the search.</div>
        ) : (
          displayedRestaurants.map(r => (
            <article key={r.id} className="card">
              <div className="card-media">
                <img
                  className="thumb"
                  src={`/images/${r.id}.jpg`}
                  alt={`${r.name} preview`}
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement
                    // try .jpeg then .png then .svg as fallbacks
                    if (img.src.endsWith('.jpg')) {
                      img.src = `/images/${r.id}.jpeg`
                      return
                    }
                    if (img.src.endsWith('.jpeg')) {
                      img.src = `/images/${r.id}.png`
                      return
                    }
                    if (img.src.endsWith('.png')) {
                      img.src = `/images/${r.id}.svg`
                      return
                    }
                    // final fallback: remove broken image visually
                    img.style.opacity = '0.6'
                  }}
                />
                <div className="price-tag">ITEMS AT ₹{r.costForTwo}</div>
                {r.rating >= 4.5 && <div className="ribbon">50% OFF</div>}
              </div>
              <div className="card-body">
                <h3>{r.name}</h3>
                <div className="meta">
                  <span className="pill">{r.cuisine}</span>
                  <span>⭐ {r.rating.toFixed(1)}</span>
                  <span>{r.deliveryTimeMin} mins</span>
                </div>
                <p className="cost">₹{r.costForTwo} for two</p>
                <div className="actions">
                  <button className="primary" onClick={() => openMenu(r.id)}>View menu</button>
                  <button className="ghost" onClick={() => saveFavorite(r.id)}>{savedFavorites.includes(r.id) ? 'Saved' : 'Save'}</button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {showFavoritesPanel && (
        <section className="favorites-panel">
          <h2>Your favorites</h2>
          {favoritesData.length === 0 ? (
            <div className="empty">No favorites yet. Click Save on a restaurant to add it.</div>
          ) : (
            <div className="list">
              {favoritesData.map(r => (
                <article key={r.id} className="card">
                  <img
                    className="thumb"
                    src={`/images/${r.id}.jpg`}
                    alt={`${r.name} preview`}
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement
                      if (img.src.endsWith('.jpg')) {
                        img.src = `/images/${r.id}.jpeg`
                        return
                      }
                      if (img.src.endsWith('.jpeg')) {
                        img.src = `/images/${r.id}.png`
                        return
                      }
                      if (img.src.endsWith('.png')) {
                        img.src = `/images/${r.id}.svg`
                        return
                      }
                      img.style.opacity = '0.6'
                    }}
                  />
                  <div className="card-body">
                    <h3>{r.name}</h3>
                    <div className="meta">
                      <span className="pill">{r.cuisine}</span>
                      <span>⭐ {r.rating.toFixed(1)}</span>
                      <span>{r.deliveryTimeMin} mins</span>
                    </div>
                    <p className="cost">₹{r.costForTwo} for two</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Menu modal */}
      {showMenuFor && (
        <div className="modal-backdrop" onClick={() => setShowMenuFor(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{showMenuFor.name} — Menu</h3>
            <div className="menu-list">
              {menuItems.map(m => (
                <div key={m.id} className="menu-item">
                  <div>
                    <strong>{m.name}</strong>
                    <div className="muted">{m.desc}</div>
                  </div>
                  <div>₹{m.price}</div>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="ghost" onClick={() => setShowMenuFor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}

      <footer />
    </div>
  )
}
