import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  getEmergencies,
  getAmbulances,
  getAssignments,
  assignAmbulance,
} from './api'
import './App.css'

const API = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const SEVERITIES = ['Critical', 'High', 'Medium', 'Low']
const TYPES = ['Accident', 'Medical', 'Fire', 'Other']
const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday',
]

const lower = value => String(value ?? '').trim().toLowerCase()

function severityOf(item) {
  return SEVERITIES.find(s => lower(s) === lower(item.severity)) || 'Medium'
}

function coordinatesOf(item) {
  const lat = item.latitude ?? item.lat
  const lng = item.longitude ?? item.lng ?? item.lon

  if (lat == null || lng == null || lat === '' || lng === '') return null

  const point = [Number(lat), Number(lng)]

  if (!point.every(Number.isFinite)) return null
  if (point[0] < -90 || point[0] > 90 || point[1] < -180 || point[1] > 180) return null

  return point
}

function dateText(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function severityPriority(item) {
  return ({ critical: 0, high: 1, medium: 2, low: 3 })[lower(item.severity)] ?? 4
}

function Badge({ value, kind = 'status' }) {
  const safeValue = value || 'Unknown'
  const classValue = lower(safeValue).replace(/[^a-z0-9-]/g, '-')

  return (
    <span className={`${kind}-badge ${classValue}`}>
      {safeValue}
    </span>
  )
}

function Metric({ label, value, detail, symbol, color }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${color}`}>{symbol}</div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  )
}

function ChartCard({ title, subtitle, data, colors, total }) {
  return (
    <section className="surface chart-card">
      <div className="card-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className="chart-total">{total}</span>
      </div>

      <div className="chart-bars">
        {data.map((item, i) => {
          const pct = total ? Math.round(item.value / total * 100) : 0
          const color = colors[i % colors.length]

          return (
            <div className="chart-row" key={item.label}>
              <div className="chart-label">
                <span>
                  <i style={{ background: color }} />
                  {item.label}
                </span>
                <strong>{item.value} <small>{pct}%</small></strong>
              </div>
              <div className="chart-track">
                <div
                  className="chart-fill"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function EmergencyCard({ item, onDispatch }) {
  const status = lower(item.status)

  return (
    <article className="emergency-card">
      <div className="emergency-card-top">
        <span className="report-number">REPORT #{item.report_id}</span>
        <Badge value={item.severity} kind="severity" />
      </div>

      <h3>{item.emergency_type || 'Emergency'}</h3>

      <p className="incident-location">
        <span>⌖</span> {item.location || 'Location not provided'}
      </p>

      <div className="incident-meta">
        <span>◷ {dateText(item.reported_at)}</span>
        <Badge value={item.status} />
      </div>

      <div className="emergency-card-bottom">
        <span className={`priority-label ${severityOf(item).toLowerCase()}`}>
          {severityOf(item)} priority
        </span>

        {status === 'pending' && (
          <button className="small-action" onClick={() => onDispatch(item.report_id)}>
            Dispatch →
          </button>
        )}
      </div>
    </article>
  )
}

export default function App() {
  const [emergencies, setEmergencies] = useState([])
  const [ambulances, setAmbulances] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const [severityFilter, setSeverityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedReport, setSelectedReport] = useState('')
  const [selectedAmbulance, setSelectedAmbulance] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [assignMessage, setAssignMessage] = useState('')
  const [assignError, setAssignError] = useState('')
  const [showAllAmbulances, setShowAllAmbulances] = useState(false)

  const [reportForm, setReportForm] = useState({
    emergency_type: 'Medical',
    location: '',
    severity: 'High',
  })
  const [reporting, setReporting] = useState(false)
  const [reportMessage, setReportMessage] = useState('')
  const [reportError, setReportError] = useState('')

  // Machine-learning prediction state
  const [predictionForm, setPredictionForm] = useState({
    location: 'Pune',
    hour: String(new Date().getHours()),
    day_of_week: String((new Date().getDay() + 6) % 7),
  })
  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [predictionError, setPredictionError] = useState('')

  const [mapMessage, setMapMessage] = useState('')
  const mapElement = useRef(null)
  const mapInstance = useRef(null)
  const markerLayer = useRef(null)

  const refreshData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    setPageError('')

    try {
      const [reportData, ambulanceData, assignmentData] = await Promise.all([
        getEmergencies(),
        getAmbulances(),
        getAssignments(),
      ])

      setEmergencies(
        Array.isArray(reportData) ? reportData : reportData?.emergencies || []
      )
      setAmbulances(
        Array.isArray(ambulanceData) ? ambulanceData : ambulanceData?.ambulances || []
      )
      setAssignments(
        Array.isArray(assignmentData) ? assignmentData : assignmentData?.assignments || []
      )
    } catch (err) {
      setPageError(err.message || 'Could not load data. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData(true)
  }, [refreshData])

  const filteredEmergencies = useMemo(() => emergencies.filter(item => {
    const severityMatch =
      severityFilter === 'All' || lower(item.severity) === lower(severityFilter)

    const statusMatch =
      statusFilter === 'All' || lower(item.status) === lower(statusFilter)

    const date = String(item.reported_at || item.created_at || '').slice(0, 10)
    const startMatch = !startDate || (date && date >= startDate)
    const endMatch = !endDate || (date && date <= endDate)

    const searchable =
      `${item.report_id} ${item.emergency_type} ${item.location} ${item.status}`.toLowerCase()

    return severityMatch && statusMatch && startMatch && endMatch &&
      searchable.includes(search.toLowerCase().trim())
  }), [emergencies, severityFilter, statusFilter, startDate, endDate, search])

  useEffect(() => {
    setCurrentPage(1)
  }, [severityFilter, statusFilter, startDate, endDate, search])

  const pendingCount = filteredEmergencies.filter(x => lower(x.status) === 'pending').length
  const assignedCount = filteredEmergencies.filter(x => lower(x.status) === 'assigned').length
  const resolvedCount = filteredEmergencies.filter(x => lower(x.status) === 'resolved').length
  const criticalCount = filteredEmergencies.filter(x => lower(x.severity) === 'critical').length

  const availableAmbulances = ambulances.filter(x => lower(x.status) === 'available')
  const busyAmbulances = ambulances.filter(x => lower(x.status) === 'busy')
  const onDutyAmbulances = ambulances.filter(x => lower(x.status) === 'on duty')

  const severityData = SEVERITIES.map(label => ({
    label,
    value: filteredEmergencies.filter(x => lower(x.severity) === lower(label)).length,
  }))

  const categoryData = TYPES.map(label => ({
    label,
    value: filteredEmergencies.filter(x => lower(x.emergency_type) === lower(label)).length,
  }))

  const fleetData = [
    { label: 'Available', value: availableAmbulances.length },
    { label: 'Busy', value: busyAmbulances.length },
    { label: 'On Duty', value: onDutyAmbulances.length },
  ]

  const sortedReports = [...filteredEmergencies].sort((a, b) =>
    severityPriority(a) - severityPriority(b) ||
    new Date(b.reported_at || 0) - new Date(a.reported_at || 0)
  )

  const perPage = 9
  const pageCount = Math.max(1, Math.ceil(sortedReports.length / perPage))
  const pageReports = sortedReports.slice((currentPage - 1) * perPage, currentPage * perPage)

  const pendingReports = [...emergencies]
    .filter(x => lower(x.status) === 'pending')
    .sort((a, b) => severityPriority(a) - severityPriority(b))

  const chosenReport = emergencies.find(x => String(x.report_id) === String(selectedReport))
  const chosenAmbulance = ambulances.find(x => String(x.ambulance_id) === String(selectedAmbulance))

  const recommendedAmbulance = chosenReport && availableAmbulances.length
    ? [...availableAmbulances].sort((a, b) => {
        const aNum = Number(String(a.ambulance_name || '').match(/\d+/)?.[0] || 9999)
        const bNum = Number(String(b.ambulance_name || '').match(/\d+/)?.[0] || 9999)
        return aNum - bNum
      })[0]
    : null

  const mapReports = useMemo(() => emergencies.map(item => ({
    item,
    point: coordinatesOf(item),
  })).filter(x => x.point), [emergencies])

  // Re-create the map when entering the map tab, and clean it up when leaving.
  useEffect(() => {
    if (activeTab !== 'map' || !mapElement.current) return undefined

    const element = mapElement.current
    const map = L.map(element).setView([18.5204, 73.8567], 10)
    mapInstance.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const markers = L.layerGroup().addTo(map)
    markerLayer.current = markers

    mapReports.forEach(({ item, point }) => {
      const color = lower(item.severity) === 'critical' ? '#ff5263'
        : lower(item.severity) === 'high' ? '#ff9b55'
        : lower(item.severity) === 'medium' ? '#f6c453'
        : '#28c9a3'

      const marker = L.circleMarker(point, {
        radius: 9,
        color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2,
      })

      // Build popup elements safely instead of interpolating report text into HTML.
      const popup = document.createElement('div')
      const heading = document.createElement('strong')
      heading.textContent = `Report #${item.report_id ?? ''}`
      popup.appendChild(heading)

      ;[
        item.emergency_type || 'Emergency',
        `Severity: ${item.severity || 'Unknown'}`,
        `Status: ${item.status || 'Unknown'}`,
        item.location || '',
      ].forEach(line => {
        const row = document.createElement('div')
        row.textContent = line
        popup.appendChild(row)
      })

      marker.bindPopup(popup).addTo(markers)
    })

    if (mapReports.length) {
      map.fitBounds(L.latLngBounds(mapReports.map(x => x.point)), {
        padding: [28, 28],
        maxZoom: 13,
      })
      setMapMessage(`${mapReports.length} incident(s) with coordinates shown.`)
    } else {
      map.setView([18.5204, 73.8567], 10)
      setMapMessage(
        'No incident coordinates are available. Pune is shown only as a demo map centre.'
      )
    }

    const timer = window.setTimeout(() => map.invalidateSize(), 150)

    return () => {
      window.clearTimeout(timer)
      map.remove()
      mapInstance.current = null
      markerLayer.current = null
    }
  }, [activeTab, mapReports])

  async function handlePrediction(event) {
    event.preventDefault()
    setPrediction(null)
    setPredictionError('')

    const location = predictionForm.location.trim()
    const hour = Number(predictionForm.hour)
    const day = Number(predictionForm.day_of_week)

    if (!location) {
      setPredictionError('Please enter a location.')
      return
    }

    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      setPredictionError('Choose an hour between 0 and 23.')
      return
    }

    if (!Number.isInteger(day) || day < 0 || day > 6) {
      setPredictionError('Please choose a valid day.')
      return
    }

    setPredicting(true)

    try {
      const params = new URLSearchParams({
        location,
        hour: String(hour),
        day_of_week: String(day),
      })

      const response = await fetch(`${API}/predict-demand?${params.toString()}`)
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.detail || 'Prediction failed. Check the backend.')
      }

      setPrediction(result)
    } catch (err) {
      setPredictionError(
        err.message || 'Could not connect to the prediction service.'
      )
    } finally {
      setPredicting(false)
    }
  }

  async function handleAssignment(event) {
    event.preventDefault()
    setAssignMessage('')
    setAssignError('')

    if (!selectedReport || !selectedAmbulance) {
      setAssignError('Select a pending emergency and an available ambulance.')
      return
    }

    if (!chosenReport || !chosenAmbulance ||
        lower(chosenReport.status) !== 'pending' ||
        lower(chosenAmbulance.status) !== 'available') {
      setAssignError('That report or ambulance is no longer available. Refresh and try again.')
      return
    }

    setAssigning(true)

    try {
      const result = await assignAmbulance(
        Number(selectedReport),
        Number(selectedAmbulance)
      )

      setAssignMessage(result?.message || 'Assignment request completed.')
      setSelectedReport('')
      setSelectedAmbulance('')
      await refreshData()
    } catch (err) {
      setAssignError(err.message || 'Assignment failed. Check the backend.')
    } finally {
      setAssigning(false)
    }
  }

  async function handleReport(event) {
    event.preventDefault()
    setReportMessage('')
    setReportError('')

    if (!reportForm.location.trim()) {
      setReportError('Enter the incident location.')
      return
    }

    setReporting(true)

    try {
      const response = await fetch(`${API}/emergencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergency_type: reportForm.emergency_type,
          location: reportForm.location.trim(),
          severity: reportForm.severity,
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.detail || result.message || 'Could not submit the report.')
      }

      setReportMessage(result.message || 'Emergency report submitted.')
      setReportForm({ emergency_type: 'Medical', location: '', severity: 'High' })
      await refreshData()
    } catch (err) {
      setReportError(err.message || 'Report submission failed.')
    } finally {
      setReporting(false)
    }
  }

  function resetFilters() {
    setSeverityFilter('All')
    setStatusFilter('All')
    setStartDate('')
    setEndDate('')
    setSearch('')
  }

  function openDispatch(reportId) {
    setSelectedReport(String(reportId))
    setActiveTab('dispatch')
    setAssignMessage('')
    setAssignError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-symbol">R</span>
          <span className="brand-name">
            ResQ<span>Flow</span>
            <small>EMERGENCY RESPONSE PLATFORM</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <button
            className={activeTab === 'overview' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'map' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab('map')}
          >
            Incident map
          </button>
          <button
            className={activeTab === 'dispatch' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveTab('dispatch')}
          >
            Smart dispatch
          </button>
        </nav>

        <a className="api-button" href={`${API}/docs`} target="_blank" rel="noreferrer">
          API docs ↗
        </a>
      </header>

      <main className="page" id="home">
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow light">
              <i /> COMMAND CENTRE <span className="hero-tag">LIVE OPERATIONS</span>
            </div>

            <h1>Every second<br /><span>makes a difference.</span></h1>
            <p>
              One clear view of emergency incidents, ambulance availability,
              and response coordination.
            </p>

            <div className="hero-actions">
              <button
                className="button button-white"
                onClick={() => refreshData(true)}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : '↻ Refresh data'}
              </button>
              <button
                className="button button-hero"
                onClick={() => document.getElementById('report-form')?.scrollIntoView({
                  behavior: 'smooth',
                })}
              >
                ＋ Report an emergency
              </button>
            </div>
          </div>

          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit-ring ring-one" />
            <div className="orbit-ring ring-two" />
            <div className="orbit-center">R<span>+</span></div>
          </div>
        </section>

        {pageError && (
          <div className="alert error-alert" role="alert">
            <strong>Unable to load data</strong>
            <span>{pageError}</span>
            <button onClick={() => refreshData(true)}>Retry</button>
          </div>
        )}

        {loading && <div className="loading-line"><span /> Connecting to ResQFlow backend…</div>}

        <section className="metric-grid">
          <Metric label="TOTAL INCIDENTS" value={filteredEmergencies.length}
            detail="Matching current filters" symbol="▦" color="navy" />
          <Metric label="PENDING RESPONSE" value={pendingCount}
            detail="Awaiting dispatch" symbol="◷" color="amber" />
          <Metric label="AMBULANCES ASSIGNED" value={assignedCount}
            detail="Response in progress" symbol="↗" color="blue" />
          <Metric label="RESOLVED INCIDENTS" value={resolvedCount}
            detail="Marked as resolved" symbol="✓" color="green" />
          <Metric label="CRITICAL INCIDENTS" value={criticalCount}
            detail="Require urgent attention" symbol="!" color="red" />
        </section>

        <div className="section-title">
          <div>
            <span className="section-kicker">SITUATION AWARENESS</span>
            <h2>
              {activeTab === 'overview' ? 'Operations overview'
                : activeTab === 'map' ? 'Incident location map'
                : 'Smart ambulance dispatch'}
            </h2>
            <p>Data is loaded from your ResQFlow API.</p>
          </div>
          <span className="live-indicator"><i /> Backend-connected view</span>
        </div>

        {activeTab === 'overview' && (
          <>
            <section className="surface filters-panel">
              <div className="filters-heading">
                <div>
                  <h3>Find an incident</h3>
                  <p>Filter reports by urgency, status, date, or keyword.</p>
                </div>
                <button className="link-button" onClick={resetFilters}>Reset filters</button>
              </div>

              <div className="filters-grid">
                <label>
                  Severity
                  <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
                    <option>All</option>
                    {SEVERITIES.map(x => <option key={x}>{x}</option>)}
                  </select>
                </label>
                <label>
                  Status
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option>All</option>
                    {['Pending', 'Assigned', 'Resolved'].map(x => <option key={x}>{x}</option>)}
                  </select>
                </label>
                <label>
                  From date
                  <input type="date" value={startDate} max={endDate || undefined}
                    onChange={e => setStartDate(e.target.value)} />
                </label>
                <label>
                  To date
                  <input type="date" value={endDate} min={startDate || undefined}
                    onChange={e => setEndDate(e.target.value)} />
                </label>
                <label className="search-box">
                  Search
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Report ID, type, location…" />
                </label>
              </div>
            </section>

            <section className="charts-grid">
              <ChartCard title="Severity breakdown" subtitle="Urgency across matching incidents"
                data={severityData} colors={['#ff5263', '#ff9b55', '#f6c453', '#28c9a3']}
                total={filteredEmergencies.length} />
              <ChartCard title="Emergency categories" subtitle="Reported incident types"
                data={categoryData} colors={['#55a5ff', '#28c9a3', '#ffb454', '#b39aff']}
                total={filteredEmergencies.length} />
              <ChartCard title="Fleet status" subtitle="Current ambulance availability"
                data={fleetData} colors={['#28c9a3', '#ff5263', '#ffb454']}
                total={ambulances.length} />
            </section>

            {/* Machine-learning demand prediction */}
            <section className="surface prediction-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">MACHINE LEARNING</span>
                  <h3>Emergency demand forecast</h3>
                  <p>Estimate emergency demand for a selected location and time.</p>
                </div>
                <span className="prediction-icon">✦</span>
              </div>

              <form className="prediction-form" onSubmit={handlePrediction}>
                <label>
                  Location
                  <input
                    value={predictionForm.location}
                    onChange={e => setPredictionForm({
                      ...predictionForm,
                      location: e.target.value,
                    })}
                    placeholder="For example, Pune"
                    required
                  />
                </label>

                <label>
                  Hour of day
                  <select
                    value={predictionForm.hour}
                    onChange={e => setPredictionForm({
                      ...predictionForm,
                      hour: e.target.value,
                    })}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Day of week
                  <select
                    value={predictionForm.day_of_week}
                    onChange={e => setPredictionForm({
                      ...predictionForm,
                      day_of_week: e.target.value,
                    })}
                  >
                    {DAYS.map((day, i) => (
                      <option key={day} value={i}>{day}</option>
                    ))}
                  </select>
                </label>

                <button className="button button-primary" type="submit" disabled={predicting}>
                  {predicting ? 'Predicting…' : '✦ Predict demand'}
                </button>
              </form>

              {predictionError && (
                <div className="alert error-alert" role="alert">{predictionError}</div>
              )}

              {prediction && (
                <div className="prediction-result" aria-live="polite">
                  <div className="prediction-number">
                    <span>Estimated demand</span>
                    <strong>{prediction.predicted_emergency_demand}</strong>
                    <small>{prediction.unit || 'estimated emergencies per observation period'}</small>
                  </div>
                  <div className="prediction-details">
                    <p><strong>Location:</strong> {prediction.location}</p>
                    <p><strong>Time:</strong> {String(prediction.hour).padStart(2, '0')}:00</p>
                    <p><strong>Model:</strong> {prediction.model || 'Machine-learning model'}</p>
                    <p className="prediction-note">
                      {prediction.data_note ||
                        'This is a demonstration estimate, not a real-world forecast.'}
                    </p>
                  </div>
                </div>
              )}

              <p className="disclaimer">
                Prototype only. Predictions use simulated training data and should not
                be used to make real emergency-response decisions.
              </p>
            </section>

            <section className="section-title section-title-compact">
              <div>
                <span className="section-kicker">INCIDENT MANAGEMENT</span>
                <h2>Emergency reports</h2>
                <p>Critical and high-priority reports appear first.</p>
              </div>
              <span className="result-count">{filteredEmergencies.length} results</span>
            </section>

            <div className="emergency-grid">
              {pageReports.map(item => (
                <EmergencyCard key={item.report_id} item={item} onDispatch={openDispatch} />
              ))}

              {!pageReports.length && (
                <div className="surface empty-state">
                  <strong>No matching emergencies</strong>
                  <p>Try resetting the filters or changing your search.</p>
                  <button className="button button-primary" onClick={resetFilters}>
                    Reset filters
                  </button>
                </div>
              )}
            </div>

            <div className="pagination">
              <span>
                Showing {pageReports.length ? (currentPage - 1) * perPage + 1 : 0}–
                {Math.min(currentPage * perPage, sortedReports.length)} of {sortedReports.length}
              </span>
              <div>
                <button disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}>← Previous</button>
                <span>Page {currentPage} / {pageCount}</span>
                <button disabled={currentPage >= pageCount}
                  onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'map' && (
          <section className="surface map-panel">
            <div className="panel-heading">
              <div>
                <h3>Geographic incident overview</h3>
                <p>Select a marker to inspect an incident. Marker positions require coordinates.</p>
              </div>
              <span className="map-count">{mapReports.length} mapped</span>
            </div>

            <div className="map-legend">
              <span><i className="critical-dot" />Critical</span>
              <span><i className="high-dot" />High</span>
              <span><i className="medium-dot" />Medium</span>
              <span><i className="low-dot" />Low</span>
            </div>

            <div className="map-canvas" ref={mapElement} />
            <p className="map-message">{mapMessage}</p>

            {!mapReports.length && (
              <div className="coordinate-notice">
                <strong>Incident coordinates are not available yet.</strong>
                <p>
                  Your API must return latitude and longitude for each incident to show
                  its marker. The map will not invent exact incident positions.
                </p>
              </div>
            )}

            <div className="section-title section-title-compact">
              <div>
                <span className="section-kicker">LOCATION DIRECTORY</span>
                <h2>Reported locations</h2>
              </div>
              <span className="result-count">{emergencies.length} reports</span>
            </div>

            <div className="location-list">
              {emergencies.slice(0, 30).map(item => (
                <div className="location-row" key={item.report_id}>
                  <div className="location-pin">⌖</div>
                  <div>
                    <strong>#{item.report_id} · {item.emergency_type}</strong>
                    <p>{item.location}</p>
                  </div>
                  <Badge value={item.severity} kind="severity" />
                </div>
              ))}
              {!emergencies.length && <p className="empty-note">No reports to show.</p>}
            </div>
          </section>
        )}

        {activeTab === 'dispatch' && (
          <>
            <div className="dispatch-grid">
              <section className="surface dispatch-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Dispatch an ambulance</h3>
                    <p>Choose a pending report and an available vehicle.</p>
                  </div>
                  <span className="dispatch-star">✦</span>
                </div>

                <form className="dispatch-form" onSubmit={handleAssignment}>
                  <label>
                    Emergency report
                    <select required value={selectedReport}
                      onChange={e => {
                        setSelectedReport(e.target.value)
                        setAssignMessage('')
                        setAssignError('')
                      }}>
                      <option value="">Select a pending emergency…</option>
                      {pendingReports.map(x => (
                        <option key={x.report_id} value={x.report_id}>
                          #{x.report_id} · {x.severity} · {x.emergency_type} — {x.location}
                        </option>
                      ))}
                    </select>
                  </label>

                  {chosenReport && (
                    <div className="recommendation-card">
                      <div>
                        <Badge value={chosenReport.severity} kind="severity" />
                        <strong>
                          {lower(chosenReport.severity) === 'critical' ? 'Immediate priority'
                            : lower(chosenReport.severity) === 'high' ? 'High priority'
                            : 'Standard response'}
                        </strong>
                      </div>
                      <p>{chosenReport.location}</p>
                      <small>
                        Demo estimate: {
                          lower(chosenReport.severity) === 'critical' ? 5
                            : lower(chosenReport.severity) === 'high' ? 10
                            : lower(chosenReport.severity) === 'medium' ? 15 : 20
                        } minutes. This is not a live traffic ETA.
                      </small>
                    </div>
                  )}

                  <label>
                    Available ambulance
                    <select required value={selectedAmbulance}
                      onChange={e => {
                        setSelectedAmbulance(e.target.value)
                        setAssignMessage('')
                        setAssignError('')
                      }}>
                      <option value="">Select an ambulance…</option>
                      {availableAmbulances.map(x => (
                        <option key={x.ambulance_id} value={x.ambulance_id}>
                          {x.ambulance_name} — {x.location}
                        </option>
                      ))}
                    </select>
                  </label>

                  {recommendedAmbulance && (
                    <button type="button" className="recommend-button"
                      onClick={() => setSelectedAmbulance(String(recommendedAmbulance.ambulance_id))}>
                      ✦ Recommend {recommendedAmbulance.ambulance_name}
                    </button>
                  )}

                  {!availableAmbulances.length && (
                    <div className="alert error-alert">
                      No ambulances are currently marked Available.
                    </div>
                  )}

                  {assignMessage && <div className="alert success-alert">{assignMessage}</div>}
                  {assignError && <div className="alert error-alert">{assignError}</div>}

                  <button className="button button-primary full-button" type="submit"
                    disabled={assigning || !availableAmbulances.length}>
                    {assigning ? 'Assigning…' : 'Confirm assignment →'}
                  </button>
                </form>
              </section>

              <section className="surface fleet-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Ambulance fleet</h3>
                    <p>Vehicle status from your backend.</p>
                  </div>
                </div>

                <div className="fleet-summary">
                  <div><strong>{availableAmbulances.length}</strong><span>Available</span></div>
                  <div><strong>{busyAmbulances.length}</strong><span>Busy</span></div>
                  <div><strong>{onDutyAmbulances.length}</strong><span>On duty</span></div>
                </div>

                <div className="fleet-list">
                  {(showAllAmbulances ? ambulances : ambulances.slice(0, 10)).map(x => (
                    <div className="fleet-row" key={x.ambulance_id}>
                      <span className="ambulance-symbol">＋</span>
                      <div>
                        <strong>{x.ambulance_name}</strong>
                        <small>{x.location}</small>
                      </div>
                      <Badge value={x.status} />
                    </div>
                  ))}
                </div>

                {ambulances.length > 10 && (
                  <button className="link-button"
                    onClick={() => setShowAllAmbulances(v => !v)}>
                    {showAllAmbulances ? 'Show fewer' : `View all ${ambulances.length} ambulances`}
                  </button>
                )}
              </section>
            </div>

            <section className="section-title section-title-compact">
              <div>
                <span className="section-kicker">AUDIT TRAIL</span>
                <h2>Assignment history</h2>
              </div>
              <span className="result-count">{assignments.length} records</span>
            </section>

            <div className="surface assignment-list">
              {assignments.slice().reverse().map((x, i) => (
                <div className="assignment-row" key={x.assignment_id ?? i}>
                  <div className="assignment-icon">✓</div>
                  <div>
                    <strong>Assignment #{x.assignment_id ?? '—'}</strong>
                    <p>Report #{x.report_id} · Ambulance #{x.ambulance_id}</p>
                    <small>{dateText(x.assigned_at)}</small>
                  </div>
                  <span>{x.estimated_response_minutes ?? '—'} min estimate</span>
                </div>
              ))}

              {!assignments.length && (
                <div className="empty-state">
                  <strong>No assignments yet</strong>
                  <p>Confirmed ambulance dispatches will appear here.</p>
                </div>
              )}
            </div>
          </>
        )}

        <section id="report-form" className="surface report-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">NEW INCIDENT</span>
              <h3>Report an emergency</h3>
              <p>Submit a report to the connected backend.</p>
            </div>
            <span className="report-plus">＋</span>
          </div>

          <form className="report-form" onSubmit={handleReport}>
            <label>
              Emergency type
              <select value={reportForm.emergency_type}
                onChange={e => setReportForm({ ...reportForm, emergency_type: e.target.value })}>
                {TYPES.map(x => <option key={x}>{x}</option>)}
              </select>
            </label>

            <label>
              Severity
              <select value={reportForm.severity}
                onChange={e => setReportForm({ ...reportForm, severity: e.target.value })}>
                {SEVERITIES.map(x => <option key={x}>{x}</option>)}
              </select>
            </label>

            <label className="report-location">
              Location / address
              <input required value={reportForm.location}
                onChange={e => setReportForm({ ...reportForm, location: e.target.value })}
                placeholder="Street, area, or landmark" />
            </label>

            <button className="button button-primary" type="submit" disabled={reporting}>
              {reporting ? 'Submitting…' : 'Submit emergency report'}
            </button>
          </form>

          {reportMessage && <div className="alert success-alert">{reportMessage}</div>}
          {reportError && <div className="alert error-alert">{reportError}</div>}

          <p className="disclaimer">
            Student prototype only — not a replacement for official emergency services.
          </p>
        </section>
      </main>

      <footer className="footer">
        <a className="footer-brand" href="#home">ResQ<span>Flow</span></a>
        <span>Emergency response management · Prototype</span>
        <a href={`${API}/docs`} target="_blank" rel="noreferrer">Backend API ↗</a>
      </footer>
    </div>
  )
}