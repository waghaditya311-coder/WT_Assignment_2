import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';

// ── Available Timezones ──────────────────────────────────────
const ALL_TIMEZONES = [
  { city: 'New York',   country: 'USA',         tz: 'America/New_York',       flag: '🇺🇸', color: '#6366f1' },
  { city: 'London',     country: 'UK',           tz: 'Europe/London',          flag: '🇬🇧', color: '#8b5cf6' },
  { city: 'Paris',      country: 'France',       tz: 'Europe/Paris',           flag: '🇫🇷', color: '#ec4899' },
  { city: 'Dubai',      country: 'UAE',          tz: 'Asia/Dubai',             flag: '🇦🇪', color: '#f59e0b' },
  { city: 'Mumbai',     country: 'India',        tz: 'Asia/Kolkata',           flag: '🇮🇳', color: '#10b981' },
  { city: 'Singapore',  country: 'Singapore',    tz: 'Asia/Singapore',         flag: '🇸🇬', color: '#06b6d4' },
  { city: 'Tokyo',      country: 'Japan',        tz: 'Asia/Tokyo',             flag: '🇯🇵', color: '#f43f5e' },
  { city: 'Sydney',     country: 'Australia',    tz: 'Australia/Sydney',       flag: '🇦🇺', color: '#22c55e' },
  { city: 'Los Angeles',country: 'USA',          tz: 'America/Los_Angeles',    flag: '🇺🇸', color: '#a855f7' },
  { city: 'Toronto',    country: 'Canada',       tz: 'America/Toronto',        flag: '🇨🇦', color: '#f97316' },
  { city: 'Berlin',     country: 'Germany',      tz: 'Europe/Berlin',          flag: '🇩🇪', color: '#3b82f6' },
  { city: 'Moscow',     country: 'Russia',       tz: 'Europe/Moscow',          flag: '🇷🇺', color: '#ef4444' },
  { city: 'Shanghai',   country: 'China',        tz: 'Asia/Shanghai',          flag: '🇨🇳', color: '#eab308' },
  { city: 'Seoul',      country: 'South Korea',  tz: 'Asia/Seoul',             flag: '🇰🇷', color: '#0ea5e9' },
  { city: 'São Paulo',  country: 'Brazil',       tz: 'America/Sao_Paulo',      flag: '🇧🇷', color: '#84cc16' },
];

const WORLD_CITIES = ALL_TIMEZONES.slice(0, 8);

// ── Helpers ──────────────────────────────────────────────────
function getTimeInTZ(tz) {
  return new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
}
function formatTime(date, is24) {
  let h = date.getHours(), m = date.getMinutes(), s = date.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (!is24) { h = h % 12 || 12; }
  return {
    time: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`,
    ampm: is24 ? '' : ampm,
    h, m, s, raw: date
  };
}
function formatDate(date) {
  return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatShortTime(date, is24=true) {
  let h = date.getHours(), m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (!is24) h = h % 12 || 12;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}${is24 ? '' : ' '+ampm}`;
}
function formatShortDate(date) {
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// ── Analog Clock SVG ─────────────────────────────────────────
function AnalogClock({ hours, minutes, seconds }) {
  const cx = 150, cy = 150, r = 135;
  const hAngle  = ((hours % 12) + minutes / 60) * 30 - 90;
  const mAngle  = (minutes + seconds / 60) * 6 - 90;
  const sAngle  = seconds * 6 - 90;
  const toRad   = deg => deg * Math.PI / 180;
  const hand    = (angle, len, w, color) => ({
    x2: cx + len * Math.cos(toRad(angle)),
    y2: cy + len * Math.sin(toRad(angle)),
    stroke: color, strokeWidth: w
  });
  const hHand = hand(hAngle, 70, 7, '#f1f5f9');
  const mHand = hand(mAngle, 100, 5, '#a5b4fc');
  const sHand = hand(sAngle, 115, 2, '#f43f5e');

  const ticks = [...Array(60)].map((_, i) => {
    const a = (i * 6 - 90) * Math.PI / 180;
    const isMajor = i % 5 === 0;
    const r1 = isMajor ? 120 : 125, r2 = r;
    return {
      x1: cx + r1 * Math.cos(a), y1: cy + r1 * Math.sin(a),
      x2: cx + r2 * Math.cos(a), y2: cy + r2 * Math.sin(a),
      stroke: isMajor ? 'rgba(165,180,252,0.8)' : 'rgba(255,255,255,0.15)',
      strokeWidth: isMajor ? 2.5 : 1
    };
  });

  const numerals = [12,1,2,3,4,5,6,7,8,9,10,11].map((n, i) => {
    const a = (i * 30 - 90) * Math.PI / 180;
    return { n, x: cx + 108 * Math.cos(a), y: cy + 108 * Math.sin(a) };
  });

  return (
    <svg width="300" height="300" viewBox="0 0 300 300" className="clock-svg">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r+6} fill="none" stroke="rgba(99,102,241,0.25)" strokeWidth="2"/>
      <circle cx={cx} cy={cy} r={r+12} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="1"/>
      {/* Face */}
      <defs>
        <radialGradient id="faceGrad" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#1e2a45"/>
          <stop offset="100%" stopColor="#0a1120"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#faceGrad)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5"/>
      {/* Ticks */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={t.stroke} strokeWidth={t.strokeWidth} strokeLinecap="round"/>
      ))}
      {/* Numerals */}
      {numerals.map(({ n, x, y }) => (
        <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(165,180,252,0.9)" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="600">{n}</text>
      ))}
      {/* Hour hand */}
      <line x1={cx} y1={cy} x2={hHand.x2} y2={hHand.y2}
            stroke={hHand.stroke} strokeWidth={hHand.strokeWidth} strokeLinecap="round" filter="url(#glow)"/>
      {/* Minute hand */}
      <line x1={cx} y1={cy} x2={mHand.x2} y2={mHand.y2}
            stroke={mHand.stroke} strokeWidth={mHand.strokeWidth} strokeLinecap="round" filter="url(#glow)"/>
      {/* Second hand */}
      <line x1={cx} y1={cy} x2={sHand.x2} y2={sHand.y2}
            stroke={sHand.stroke} strokeWidth={sHand.strokeWidth} strokeLinecap="round"/>
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={8} fill="#6366f1" stroke="#a5b4fc" strokeWidth="2"/>
      <circle cx={cx} cy={cy} r={3} fill="#f43f5e"/>
    </svg>
  );
}

// ── World Cities Grid ─────────────────────────────────────────
function WorldCitiesGrid({ now }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="world-tz-grid">
      {WORLD_CITIES.map(c => {
        const d = getTimeInTZ(c.tz);
        return (
          <div key={c.tz} className="world-tz-card">
            <div className="world-tz-flag">{c.flag}</div>
            <div className="world-tz-city">{c.city}</div>
            <div className="world-tz-time">{formatShortTime(d)}</div>
            <div className="world-tz-date">{formatShortDate(d)}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Stopwatch ─────────────────────────────────────────────────
function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState([]);
  const lastLap = useRef(0);
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  const fmt = ms => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
  };

  const start = () => {
    startRef.current = Date.now() - elapsed;
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startRef.current);
    }, 10);
    setRunning(true);
  };
  const pause = () => { clearInterval(intervalRef.current); setRunning(false); };
  const reset = () => { clearInterval(intervalRef.current); setRunning(false); setElapsed(0); setLaps([]); lastLap.current = 0; };
  const lap = () => {
    const diff = elapsed - lastLap.current;
    setLaps(prev => [{ total: elapsed, diff }, ...prev]);
    lastLap.current = elapsed;
  };

  return (
    <>
      <div className="stopwatch-display">{fmt(elapsed)}</div>
      <div className="sw-controls">
        {!running
          ? <button className="sw-btn start" onClick={start}>▶ Start</button>
          : <button className="sw-btn pause" onClick={pause}>⏸ Pause</button>
        }
        <button className="sw-btn reset" onClick={reset}>↺ Reset</button>
        {running && <button className="sw-btn lap" onClick={lap}>⚑ Lap</button>}
      </div>
      {laps.length > 0 && (
        <div className="lap-list">
          {laps.map((l, i) => (
            <div key={i} className="lap-item">
              <span className="lap-num">Lap {laps.length - i}</span>
              <span className="lap-time">{fmt(l.total)}</span>
              <span className="lap-diff">+{fmt(l.diff)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Alarm Manager ─────────────────────────────────────────────
function AlarmManager({ currentTime }) {
  const [alarms, setAlarms] = useState([
    { id: 1, time: '07:00', label: 'Wake Up', on: true },
  ]);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [ringing, setRinging] = useState(null);

  useEffect(() => {
    const hhmm = `${String(currentTime.getHours()).padStart(2,'0')}:${String(currentTime.getMinutes()).padStart(2,'0')}`;
    const secs  = currentTime.getSeconds();
    if (secs === 0) {
      const triggered = alarms.find(a => a.on && a.time === hhmm);
      if (triggered) setRinging(triggered);
    }
  }, [currentTime, alarms]);

  const addAlarm = () => {
    if (!newTime) return;
    setAlarms(prev => [...prev, { id: Date.now(), time: newTime, label: newLabel || 'Alarm', on: true }]);
    setNewTime(''); setNewLabel('');
  };
  const toggle = id => setAlarms(prev => prev.map(a => a.id === id ? { ...a, on: !a.on } : a));
  const remove = id => setAlarms(prev => prev.filter(a => a.id !== id));
  const dismiss = () => setRinging(null);

  return (
    <>
      {ringing && (
        <div className="alarm-notification">
          <div className="alarm-notif-title">🔔 Alarm!</div>
          <div className="alarm-notif-time">{ringing.time}</div>
          <div className="alarm-notif-label">{ringing.label}</div>
          <button className="alarm-dismiss" onClick={dismiss}>Dismiss</button>
        </div>
      )}
      <div className="alarm-form">
        <div className="alarm-input-row">
          <div>
            <div className="alarm-label">Time</div>
            <input type="time" className="alarm-input" value={newTime}
                   onChange={e => setNewTime(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="alarm-label">Label</div>
            <input type="text" className="alarm-input" placeholder="e.g. Lunch break"
                   value={newLabel} onChange={e => setNewLabel(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-alarm" onClick={addAlarm}>+ Add</button>
          </div>
        </div>
      </div>
      <div className="alarm-list">
        {alarms.map(a => (
          <div key={a.id} className={`alarm-item${ringing?.id === a.id ? ' ringing' : ''}`}>
            <div>
              <div className="alarm-time-display">{a.time}</div>
              <div className="alarm-label-text">{a.label}</div>
            </div>
            <div className="alarm-controls">
              <button className={`alarm-toggle${a.on ? ' on' : ''}`} onClick={() => toggle(a.id)}
                      aria-label={a.on ? 'Disable alarm' : 'Enable alarm'} />
              <button className="btn-del" onClick={() => remove(a.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Timezone Manager ──────────────────────────────────────────
function TimezoneManager() {
  const [selected, setSelected] = useState([
    ALL_TIMEZONES[0], ALL_TIMEZONES[4], ALL_TIMEZONES[6], ALL_TIMEZONES[7]
  ]);
  const [toAdd, setToAdd] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const available = ALL_TIMEZONES.filter(tz => !selected.find(s => s.tz === tz.tz));

  const add = () => {
    if (!toAdd) return;
    const found = ALL_TIMEZONES.find(t => t.tz === toAdd);
    if (found) { setSelected(prev => [...prev, found]); setToAdd(''); }
  };
  const remove = tz => setSelected(prev => prev.filter(t => t.tz !== tz));

  const getOffset = tz => {
    const d = new Date();
    const local = d.getTime();
    const tz_d = new Date(d.toLocaleString('en-US', { timeZone: tz }));
    const diff = Math.round((tz_d - d + d.getTimezoneOffset() * 60000) / 3600000);
    return diff >= 0 ? `UTC+${diff}` : `UTC${diff}`;
  };

  return (
    <>
      <div className="tz-list">
        {selected.map(tz => {
          const d = getTimeInTZ(tz.tz);
          return (
            <div key={tz.tz} className="tz-item" style={{ '--tz-color': tz.color }}>
              <div>
                <div className="tz-city">{tz.flag} {tz.city}</div>
                <div className="tz-country">{tz.country}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="tz-time">{formatShortTime(d)}</div>
                <div className="tz-offset">{getOffset(tz.tz)}</div>
              </div>
              <button className="tz-remove-btn" onClick={() => remove(tz.tz)} aria-label="Remove timezone">✕</button>
            </div>
          );
        })}
      </div>
      <div className="tz-add">
        <select className="tz-select" value={toAdd} onChange={e => setToAdd(e.target.value)}>
          <option value="">— Add a timezone —</option>
          {available.map(t => (
            <option key={t.tz} value={t.tz}>{t.flag} {t.city}, {t.country}</option>
          ))}
        </select>
        <button className="btn-add" onClick={add}>+ Add</button>
      </div>
    </>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function ClockDashboard() {
  const [now, setNow] = useState(new Date());
  const [is24, setIs24] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { time, ampm, h, m, s } = formatTime(now, is24);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div>
          <div className="dash-title">⏱ World Clock Dashboard</div>
          <div className="dash-subtitle">Real-time clock • Timezones • Alarms • Stopwatch</div>
        </div>
        <div className="dash-badge">WT Assignment 2</div>
      </div>

      {/* Row 1: Analog + Digital */}
      <div className="main-grid">
        {/* Analog Clock */}
        <div className="card">
          <div className="card-title"><span className="card-title-dot"></span>Analog Clock</div>
          <div className="analog-clock-wrapper">
            <AnalogClock hours={now.getHours()} minutes={now.getMinutes()} seconds={now.getSeconds()} />
            <div className="seconds-ring-text">{now.getSeconds()}s elapsed this minute</div>
          </div>
        </div>

        {/* Digital Clock */}
        <div className="card">
          <div className="card-title"><span className="card-title-dot"></span>Digital Clock</div>
          <div className="format-toggle">
            <button className={`format-btn${!is24 ? ' active' : ''}`} onClick={() => setIs24(false)}>12h</button>
            <button className={`format-btn${is24 ? ' active' : ''}`} onClick={() => setIs24(true)}>24h</button>
          </div>
          <div className="digital-time">
            {time}{ampm && <span className="digital-ampm">{ampm}</span>}
          </div>
          <div className="digital-date">{formatDate(now)}</div>
          <div className="digital-day">{days[now.getDay()].toUpperCase()}</div>
          <div style={{ marginTop: '24px' }}>
            <div className="card-title" style={{ marginBottom: '12px' }}><span className="card-title-dot" style={{ background: '#f43f5e', boxShadow: '0 0 8px #f43f5e' }}></span>Alarms</div>
            <AlarmManager currentTime={now} />
          </div>
        </div>
      </div>

      {/* Row 2: Timezones + Stopwatch */}
      <div className="main-grid">
        <div className="card">
          <div className="card-title"><span className="card-title-dot" style={{ background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }}></span>Timezone Manager</div>
          <TimezoneManager />
        </div>
        <div className="card">
          <div className="card-title"><span className="card-title-dot" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>Stopwatch</div>
          <Stopwatch />
        </div>
      </div>

      {/* Row 3: World Cities */}
      <div className="card">
        <div className="card-title"><span className="card-title-dot" style={{ background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }}></span>World Cities – Live Time</div>
        <WorldCitiesGrid now={now} />
      </div>

      <div className="dash-footer">
        WT Assignment 2 &nbsp;|&nbsp; Real-time Clock Dashboard &nbsp;|&nbsp; React + Vite &nbsp;|&nbsp; WET TY Batch 26
      </div>
    </div>
  );
}
