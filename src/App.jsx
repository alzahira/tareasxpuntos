import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, LayoutList, Gift, Settings, Trash2, Cloud, RefreshCw, ChevronLeft, ChevronRight, Menu, X, Download, Banknote, Gamepad2, TentTree } from 'lucide-react';
import { TaskCard } from './components/TaskCard';
import { RewardShop } from './components/RewardShop';
import { AdminPanel } from './components/AdminPanel';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { Modal } from './components/Modal';
import { TaskForm } from './components/TaskForm';
import { RewardForm } from './components/RewardForm';
import { supabase } from './supabase';

const INITIAL_TASKS = [
  { id: 't1', title: 'Poner la mesa', type: 'obligatory', points: 5, completed: false, frequency: 'daily' },
  { id: 't2', title: 'No contestar mal', type: 'obligatory', points: 5, completed: false, frequency: 'daily' },
  { id: 't3', title: 'Acostarse a la hora', type: 'obligatory', points: 5, completed: false, frequency: 'daily' },
  { id: 't4', title: 'Hacer la cama', type: 'obligatory', points: 5, completed: false, frequency: 'daily' },
  { id: 't5', title: 'Tener cuarto recogido', type: 'obligatory', points: 5, completed: false, frequency: 'daily' },
  { id: 't6', title: 'Limpiar zona común', type: 'bonus', points: 5, completed: false, frequency: 'weekly' },
  { id: 't7', title: 'No protestar por la tele', type: 'bonus', points: 2, completed: false, frequency: 'daily' },
  { id: 't8', title: 'Semana sin enfados', type: 'bonus', points: 15, completed: false, frequency: 'weekly' },
];

const INITIAL_REWARDS = [
  { id: 'r1', title: '10 min extra de Consola', cost: 5 },
  { id: 'r2', title: 'Elegir comida semanal', cost: 5 },
];

function App() {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [history, setHistory] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('tasks'); // 'tasks', 'rewards', 'admin', 'calendar'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [weeklyPoints, setWeeklyPoints] = useState(0); // Points for current week (resets Saturday)
  const [previousWeekStatus, setPreviousWeekStatus] = useState(null); // 'success' | 'fail' | null

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null, // 'task' or 'reward'
    mode: null, // 'add' or 'edit'
    item: null
  });

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check for iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // Capture install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // Helper: Get start of current week (Last Saturday)
  const getStartOfWeek = (dateString) => {
    const d = new Date(dateString);
    const day = d.getDay(); // 0 is Sunday, 6 is Saturday
    // If today is Saturday, today is start. Else, go back to last Saturday.
    // If Sunday (0), go back 1 day.
    // If Monday (1), go back 2 days...
    // Formula: if day === 6 return 0 diff. Else diff is day + 1.
    const diff = day === 6 ? 0 : day + 1;
    d.setDate(d.getDate() - diff);
    return d.toISOString().split('T')[0];
  };

  const calculateWeeklyPoints = (historyData, referenceDate = new Date().toISOString().split('T')[0]) => {
    const startOfWeek = getStartOfWeek(referenceDate);
    let wPoints = 0;

    // Iterate from startOfWeek to today (or end of week)
    const current = new Date(startOfWeek);
    const end = new Date(referenceDate);

    // Safety break to prevent infinite loops
    let safety = 0;
    while (current <= end && safety < 100) {
      const dateStr = current.toISOString().split('T')[0];
      if (historyData[dateStr]) {
        wPoints += historyData[dateStr].points || 0;
      }
      current.setDate(current.getDate() + 1);
      safety++;
    }
    return wPoints;
  };

  // Check previous week status
  const checkPreviousWeek = (historyData) => {
    const today = new Date();
    // Get last Saturday (start of current week)
    const currentWeekStart = new Date(getStartOfWeek(today.toISOString().split('T')[0]));

    // Go back one day to get Friday of previous week
    const prevWeekEnd = new Date(currentWeekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 1); // Friday

    // Calculate points for that previous week (Saturday -> Friday)
    // Start of prev week is prevWeekEnd - 6 days
    const prevWeekStart = new Date(prevWeekEnd);
    prevWeekStart.setDate(prevWeekStart.getDate() - 6); // Last-Last Saturday

    let pPoints = 0;
    const current = new Date(prevWeekStart);
    while (current <= prevWeekEnd) {
      const dateStr = current.toISOString().split('T')[0];
      if (historyData[dateStr]) {
        pPoints += (historyData[dateStr].points || 0);
      }
      current.setDate(current.getDate() + 1);
    }

    return pPoints >= 175 ? 'success' : 'fail';
  };

  // Load data from Supabase on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Tasks
      let { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*').order('created_at');
      if (tasksError) throw tasksError;

      // Seed initial tasks if empty
      if (!tasksData || tasksData.length === 0) {
        const { data: newTasks } = await supabase.from('tasks').insert(INITIAL_TASKS).select();
        tasksData = newTasks;
      }
      if (tasksData) setTasks(tasksData);

      // 2. Fetch Rewards
      let { data: rewardsData } = await supabase.from('rewards').select('*').order('created_at');

      // Seed initial rewards if empty
      if (!rewardsData || rewardsData.length === 0) {
        const { data: newRewards } = await supabase.from('rewards').insert(INITIAL_REWARDS).select();
        rewardsData = newRewards;
      }
      if (rewardsData) setRewards(rewardsData);

      // 3. Fetch App State (Points & History)
      const { data: stateData } = await supabase.from('app_state').select('*');
      if (stateData) {
        const pointsRow = stateData.find(s => s.key === 'points');
        const historyRow = stateData.find(s => s.key === 'history');

        if (pointsRow) setPoints(Number(pointsRow.value));
        if (historyRow) {
          const hist = historyRow.value || {};
          setHistory(hist);
          setWeeklyPoints(calculateWeeklyPoints(hist));
          setPreviousWeekStatus(checkPreviousWeek(hist));
        }
      }

    } catch (error) {
      console.error("Error connecting to database:", error);
      console.warn("Error connecting to database. Loading Demo Mode.", error);
      setTasks(INITIAL_TASKS);
      setRewards(INITIAL_REWARDS);
      setPoints(320); // Dummy accumulated points

      // Mock History for Demo
      const MOCK_HISTORY = {
        // Success Week: Jan 10 - Jan 16 (Total 210)
        '2026-01-10': { points: 30 }, '2026-01-11': { points: 30 }, '2026-01-12': { points: 30 },
        '2026-01-13': { points: 30 }, '2026-01-14': { points: 30 }, '2026-01-15': { points: 30 }, '2026-01-16': { points: 30 },

        // Failed Week: Jan 3 - Jan 9 (Total 70)
        '2026-01-03': { points: 10 }, '2026-01-04': { points: 10 }, '2026-01-05': { points: 10 },
        '2026-01-06': { points: 10 }, '2026-01-07': { points: 10 }, '2026-01-08': { points: 10 }, '2026-01-09': { points: 10 },
      };

      setHistory(MOCK_HISTORY);
      setWeeklyPoints(calculateWeeklyPoints(MOCK_HISTORY));
      setPreviousWeekStatus(checkPreviousWeek(MOCK_HISTORY));
    } finally {
      setLoading(false);
    }
  };

  // Helper to update global state in DB
  const updateAppState = async (key, value) => {
    const { error } = await supabase.from('app_state').upsert({ key, value });
    if (error) throw error;
  };

  const handleToggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const today = new Date().toISOString().split('T')[0];
    const isToday = currentDate === today;

    const oldPoints = points;
    const oldHistory = history;
    const oldTasks = tasks;

    // Source of truth is History for the current selected date
    const dayHistory = history[currentDate] || { points: 0, tasks: {} };
    const wasCompleted = !!dayHistory.tasks?.[id];
    const isCompleting = !wasCompleted;

    // -- Calculate new Points --
    // We update global points regardless of the day (it's a running total)
    let newPoints = points;
    if (isCompleting) {
      newPoints += task.points;
      if (isToday) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      newPoints = Math.max(0, points - task.points);
    }

    // -- Calculate new History for Selected Date --
    const newDayPoints = isCompleting
      ? (dayHistory.points || 0) + task.points
      : Math.max(0, (dayHistory.points || 0) - task.points);

    // Explicitly set true/false in history
    const newDayTasks = { ...dayHistory.tasks, [id]: isCompleting };

    const newHistory = {
      ...history,
      [currentDate]: {
        points: newDayPoints,
        tasks: newDayTasks
      }
    };

    // -- Update Local State --
    setPoints(newPoints);
    setHistory(newHistory);
    // Recalculate weekly points based on updated history
    setWeeklyPoints(calculateWeeklyPoints(newHistory));

    // Update tasks array ONLY if it's today (for visual consistency if we switch views, though UI relies on history now)
    if (isToday) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: isCompleting } : t));
    }

    // -- Update DB --
    try {
      const promises = [
        updateAppState('points', newPoints),
        updateAppState('history', newHistory)
      ];

      // Only sync 'completed' column in tasks table if modifying Today
      // This ensures the "default" state of the DB reflects the current day
      if (isToday) {
        promises.push(supabase.from('tasks').update({ completed: isCompleting }).eq('id', id).then(res => { if(res.error) throw res.error; }));
      }

      await Promise.all(promises);
    } catch (err) {
      console.error("Error saving progress:", err);
      alert("Error de conexión. Tus cambios no se han guardado.");
      setPoints(oldPoints);
      setHistory(oldHistory);
      setWeeklyPoints(calculateWeeklyPoints(oldHistory));
      setTasks(oldTasks);
    }
  };

  const changeDate = (days) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const openModal = (type, mode, item = null) => {
    setModalConfig({ isOpen: true, type, mode, item });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (modalConfig.mode === 'add') {
        const newTask = { ...taskData, id: Date.now().toString(), completed: false };
        // Local
        setTasks(prev => [...prev, newTask]);
        // DB
        const { error } = await supabase.from('tasks').insert(newTask);
        if (error) throw error;
      } else if (modalConfig.mode === 'edit') {
        // Local
        setTasks(prev => prev.map(t => t.id === modalConfig.item.id ? { ...t, ...taskData } : t));
        // DB
        const { id, ...updates } = taskData; // don't update ID usually, but here ID is in item
        const { error } = await supabase.from('tasks').update(taskData).eq('id', modalConfig.item.id);
        if (error) throw error;
      }
      closeModal();
    } catch (err) {
      console.error("Error saving task:", err);
      alert("Error al guardar la tarea. Puede que tus cambios no se hayan guardado en la nube.");
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('¿Borrar esta tarea?')) {
      const oldTasks = tasks;
      // Local
      setTasks(prev => prev.filter(t => t.id !== id));
      // DB
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        console.error(error);
        alert("Error al borrar. Restaurando tarea.");
        setTasks(oldTasks);
      }
    }
  };

  const handleSaveReward = async (rewardData) => {
    try {
      if (modalConfig.mode === 'add') {
        const newReward = { ...rewardData, id: Date.now().toString() };
        setRewards(prev => [...prev, newReward]);
        const { error } = await supabase.from('rewards').insert(newReward);
        if (error) throw error;
      } else if (modalConfig.mode === 'edit') {
        setRewards(prev => prev.map(r => r.id === modalConfig.item.id ? { ...r, ...rewardData } : r));
        const { error } = await supabase.from('rewards').update(rewardData).eq('id', modalConfig.item.id);
        if (error) throw error;
      }
      closeModal();
    } catch (err) {
      console.error("Error saving reward:", err);
      alert("Error al guardar el premio en la nube.");
    }
  };

  const handleDeleteReward = async (id) => {
    if (window.confirm('¿Borrar este premio?')) {
      const oldRewards = rewards;
      setRewards(prev => prev.filter(r => r.id !== id));
      const { error } = await supabase.from('rewards').delete().eq('id', id);
      if (error) {
        console.error(error);
        alert("Error al borrar. Restaurando premio.");
        setRewards(oldRewards);
      }
    }
  };

  const handleRedeemReward = async (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && points >= reward.cost) {
      if (window.confirm(`¿Canjear "${reward.title}" por ${reward.cost} puntos?`)) {
        const oldPoints = points;
        const newPoints = points - reward.cost;
        setPoints(newPoints);

        try {
          await updateAppState('points', newPoints);
          alert(`¡Disfruta tu premio: ${reward.title}!`);
        } catch(err) {
          console.error(err);
          alert("Error de conexión. No se han descontado los puntos en la nube.");
          setPoints(oldPoints);
        }
      }
    }
  };

  // Generate last 7 days for calendar
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)', color: 'white' }}>
        <h2><RefreshCw className="spin" /> Cargando tus datos...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <div className="header-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Burger Button (Mobile Only) */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(to right, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              A99 Calendar
            </h1>
          </div>



          {/* Desktop & Mobile Menu Navigation */}
          <nav className={`main-nav ${isMenuOpen ? 'menu-open' : ''}`}>
            <button
              onClick={() => { setView('tasks'); setIsMenuOpen(false); }}
              className={`nav-btn ${view === 'tasks' ? 'active' : ''}`}
            >
              <LayoutList size={20} />
              <span>Tareas</span>
            </button>
            <button
              onClick={() => { setView('rewards'); setIsMenuOpen(false); }}
              className={`nav-btn ${view === 'rewards' ? 'active' : ''}`}
            >
              <Gift size={20} />
              <span>Premios</span>
            </button>
            <button
              onClick={() => { setView('calendar'); setIsMenuOpen(false); }}
              className={`nav-btn ${view === 'calendar' ? 'active' : ''}`}
            >
              <RefreshCw size={20} />
              <span>Progreso</span>
            </button>
            <button
              onClick={() => { setView('admin'); setIsMenuOpen(false); }}
              className={`nav-btn ${view === 'admin' ? 'active' : ''}`}
            >
              <Settings size={20} />
              <span>Admin</span>
            </button>

            {/* Install Button (Android/Desktop) */}
            {deferredPrompt && (
              <button
                onClick={() => { handleInstallClick(); setIsMenuOpen(false); }}
                className="nav-btn"
                style={{ color: '#4ade80' }}
              >
                <Download size={20} />
                <span>Instalar App</span>
              </button>
            )}

            {/* iOS Instructions */}
            {isIOS && (
              <div className="nav-btn" style={{ fontSize: '0.8rem', opacity: 0.7, flexDirection: 'column', alignItems: 'flex-start', cursor: 'default' }}>
                <span>📱 Para instalar en iOS:</span>
                <span>Pulsa "Compartir" y luego "Añadir a inicio"</span>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        {view === 'tasks' && (
          <div className="animate-fade-in">
            {/* Unified Progress & Rewards Card */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFD700' }}>
                  <Star fill="#FFD700" size={24} /> Progreso Semanal
                </h3>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'block' }}>{weeklyPoints} / 175</span>
                  {previousWeekStatus && (
                    <span style={{
                      fontSize: '0.8rem',
                      color: previousWeekStatus === 'success' ? '#4ade80' : '#ef4444',
                      display: 'block'
                    }}>
                      Semana Pasada: {previousWeekStatus === 'success' ? '¡Completada!' : 'Fallida'}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (weeklyPoints / 175) * 100)}%`,
                  background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>

              {/* Rewards Grid - Consistent & Compact */}
              <h4 style={{ margin: '0 0 1rem 0', opacity: 0.8, fontSize: '0.9rem' }}>Recompensas Disponibles:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>

                {/* Color-coded Rewards */}
                {[
                  { label: 'Paga Semanal', icon: <Banknote size={22} />, pointsNeeded: 175, theme: { main: '#10b981', light: '#ecfdf5', border: '#34d399' } },
                  { label: '1h Consola', icon: <Gamepad2 size={22} />, pointsNeeded: 175, theme: { main: '#3b82f6', light: '#eff6ff', border: '#60a5fa' } },
                  { label: 'Parque', icon: <TentTree size={22} />, pointsNeeded: 175, theme: { main: '#f59e0b', light: '#fffbeb', border: '#fbbf24' } }
                ].map((r, i) => {
                  const isUnlocked = weeklyPoints >= r.pointsNeeded;
                  return (
                    <div key={i} style={{
                      background: isUnlocked ? r.theme.light : 'white',
                      border: isUnlocked ? `2px solid ${r.theme.main}` : '2px solid #f1f5f9',
                      color: isUnlocked ? r.theme.main : '#94a3b8',
                      padding: '1rem',
                      borderRadius: '16px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textAlign: 'center',
                      boxShadow: isUnlocked ? `0 4px 12px ${r.theme.main}30` : 'none',
                      transform: isUnlocked ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                      <div style={{
                        padding: '0.6rem',
                        borderRadius: '50%',
                        background: isUnlocked ? r.theme.main : '#f1f5f9',
                        color: isUnlocked ? 'white' : '#cbd5e1',
                        marginBottom: '0.2rem',
                        boxShadow: isUnlocked ? `0 2px 8px ${r.theme.main}40` : 'none'
                      }}>
                        {r.icon}
                      </div>
                      <span style={{ fontWeight: '700', lineHeight: '1.2' }}>{r.label}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', opacity: 0.9 }}>{isUnlocked ? '¡CONSEGUIDO!' : `${weeklyPoints}/${r.pointsNeeded}`}</span>
                    </div>
                  )
                })}

                {/* Tuesday Bonus Logic - Purple Theme */}
                {(() => {
                  const startOfWeek = getStartOfWeek(new Date().toISOString().split('T')[0]);
                  let tuesdayPoints = 0;
                  const d = new Date(startOfWeek);
                  for (let i = 0; i < 4; i++) { // Sat-Tue
                    const dateStr = d.toISOString().split('T')[0];
                    if (history[dateStr]) tuesdayPoints += (history[dateStr].points || 0);
                    d.setDate(d.getDate() + 1);
                  }
                  const isAchieved = tuesdayPoints >= 100;
                  const theme = { main: '#8b5cf6', light: '#f5f3ff', border: '#a78bfa' }; // Violet

                  return (
                    <div style={{
                      background: isAchieved ? theme.light : 'white',
                      border: isAchieved ? `2px solid ${theme.main}` : '2px solid #f1f5f9',
                      color: isAchieved ? theme.main : '#94a3b8',
                      padding: '1rem',
                      borderRadius: '16px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isAchieved ? `0 4px 12px ${theme.main}30` : 'none',
                      transform: isAchieved ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                      {/* Badge */}
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        background: isAchieved ? theme.main : '#e2e8f0',
                        color: 'white',
                        fontSize: '0.65rem', padding: '3px 8px',
                        borderBottomLeftRadius: '10px', fontWeight: '800',
                        letterSpacing: '0.5px'
                      }}>
                        SÁB-MAR
                      </div>

                      <div style={{
                        padding: '0.6rem',
                        borderRadius: '50%',
                        background: isAchieved ? theme.main : '#f1f5f9',
                        color: isAchieved ? 'white' : '#cbd5e1',
                        marginBottom: '0.2rem',
                        boxShadow: isAchieved ? `0 2px 8px ${theme.main}40` : 'none'
                      }}>
                        <Gamepad2 size={22} />
                      </div>
                      <span style={{ fontWeight: '700', lineHeight: '1.2' }}>30 min Extra</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', opacity: 0.9 }}>
                        {isAchieved ? '¡CONSEGUIDO!' : `${tuesdayPoints}/100`}
                      </span>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* Date Navigator in Tasks View */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
              background: 'white',
              padding: '0.8rem',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-sm)',
              maxWidth: '400px',
              margin: '0 auto 1.5rem auto'
            }}>
              <button
                onClick={() => changeDate(-1)}
                style={{
                  background: 'var(--color-background)',
                  border: '1px solid #eee',
                  color: 'var(--color-text)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <h3 style={{ margin: 0, minWidth: '150px', textAlign: 'center', color: 'var(--color-text)', fontSize: '1.1rem' }}>
                {new Date(currentDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
              </h3>

              <button
                onClick={() => changeDate(1)}
                disabled={currentDate === new Date().toISOString().split('T')[0]}
                style={{
                  background: currentDate === new Date().toISOString().split('T')[0] ? '#f5f5f5' : 'var(--color-background)',
                  border: '1px solid #eee',
                  color: currentDate === new Date().toISOString().split('T')[0] ? '#ccc' : 'var(--color-text)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: currentDate === new Date().toISOString().split('T')[0] ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <h2 className="section-title">Tareas del {currentDate === new Date().toISOString().split('T')[0] ? 'Hoy' : 'Día'}</h2>
            <div className="grid-layout">
              {tasks.map(task => {
                // Determine if completed based on history for this date
                const isCompletedOnDate = history[currentDate]?.tasks?.[task.id] || false;

                return (
                  <TaskCard
                    key={task.id}
                    task={{ ...task, completed: isCompletedOnDate }} // Override completed status
                    onToggle={() => handleToggleTask(task.id)}
                  />
                );
              })}
            </div>
            {tasks.length === 0 && (
              <p style={{ textAlign: 'center', opacity: 0.7 }}>No hay tareas configuradas.</p>
            )}
          </div>
        )}

        {view === 'rewards' && (
          <div className="animate-fade-in">
            <h2 className="section-title">Tienda de Premios</h2>
            <RewardShop
              rewards={rewards}
              userPoints={points}
              onRedeem={handleRedeemReward}
            />
          </div>
        )}

        {view === 'calendar' && (
          <div className="animate-fade-in">
            <h2 className="section-title">Historial Semanal</h2>
            <WeeklyCalendar history={history} weekDays={getLast7Days()} />

            {/* Cloud Indicator */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Cloud size={24} color="#4ade80" />
              <div>
                <h4 style={{ margin: 0 }}>Sincronizado en la Nube</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>Tus datos se guardan en Supabase y son accesibles desde cualquier dispositivo.</p>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanel
              tasks={tasks}
              rewards={rewards}
              onAddTask={() => openModal('task', 'add')}
              onAddReward={() => openModal('reward', 'add')}
              onEditTask={(task) => openModal('task', 'edit', task)}
              onEditReward={(reward) => openModal('reward', 'edit', reward)}
              onDeleteTask={handleDeleteTask}
              onDeleteReward={handleDeleteReward}
            />
          </div>
        )}
      </main>

      {/* Modal */}
      <Modal isOpen={modalConfig.isOpen} onClose={closeModal} title={
        modalConfig.mode === 'add'
          ? (modalConfig.type === 'task' ? 'Nueva Tarea' : 'Nuevo Premio')
          : (modalConfig.type === 'task' ? 'Editar Tarea' : 'Editar Premio')
      }>
        {modalConfig.type === 'task' ? (
          <TaskForm
            initialData={modalConfig.item}
            onSave={handleSaveTask}
            onCancel={closeModal}
          />
        ) : (
          <RewardForm
            initialData={modalConfig.item}
            onSave={handleSaveReward}
            onCancel={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}

export default App;
