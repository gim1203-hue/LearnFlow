import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutGrid, BookOpen, ClipboardCheck, StickyNote, BarChart3, Settings,
  Search, Bell, Plus, MoreHorizontal, ArrowUpRight, Clock3, CalendarDays,
  Check, ChevronRight, Play, Flame, Target, X, Menu, SlidersHorizontal
} from 'lucide-react';
import './styles.css';
import { isSupabaseConfigured, supabase } from './lib/supabase';

const courses = [
  { id: 1, code: 'CS 301', title: 'Data Structures', instructor: 'Dr. Alex Morgan', icon: '⌘', color: '#7968e8', soft: '#eeeafe', progress: 76, next: 'Graph algorithms', meeting: 'Tue · 10:00 AM' },
  { id: 2, code: 'MATH 204', title: 'Linear Algebra', instructor: 'Prof. Elena Ruiz', icon: '△', color: '#df7d59', soft: '#faebe4', progress: 58, next: 'Eigenvalues', meeting: 'Wed · 1:30 PM' },
  { id: 3, code: 'PSY 110', title: 'Cognitive Psychology', instructor: 'Dr. Sam Kim', icon: '◎', color: '#39a48c', soft: '#e0f3ed', progress: 84, next: 'Memory & recall', meeting: 'Thu · 9:00 AM' },
  { id: 4, code: 'DES 215', title: 'Interaction Design', instructor: 'Maya Bennett', icon: '✦', color: '#4379cf', soft: '#e6eefb', progress: 42, next: 'Prototype critique', meeting: 'Fri · 2:00 PM' },
];

const starterTasks = [
  { id: 1, title: 'Problem Set 6', course: 'MATH 204', courseId: 2, due: 'Today', time: '11:59 PM', priority: 'High', done: false },
  { id: 2, title: 'Graph Traversal Lab', course: 'CS 301', courseId: 1, due: 'Tomorrow', time: '5:00 PM', priority: 'High', done: false },
  { id: 3, title: 'Reading response', course: 'PSY 110', courseId: 3, due: 'Sep 28', time: '9:00 AM', priority: 'Medium', done: false },
  { id: 4, title: 'Wireframe iteration', course: 'DES 215', courseId: 4, due: 'Sep 30', time: '2:00 PM', priority: 'Medium', done: false },
  { id: 5, title: 'Quiz: Vector spaces', course: 'MATH 204', courseId: 2, due: 'Oct 02', time: '11:59 PM', priority: 'Low', done: false },
];

const nav = [
  [LayoutGrid, 'Overview'], [BookOpen, 'My courses'], [ClipboardCheck, 'Assignments'],
  [StickyNote, 'Notes'], [BarChart3, 'Progress'],
];

function usePersistentTasks(userId) {
  const storageKey = `learnflow-tasks-v2-${userId}`;
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
    catch { return []; }
  });
  useEffect(() => localStorage.setItem(storageKey, JSON.stringify(tasks)), [storageKey, tasks]);
  return [tasks, setTasks];
}

function Sidebar({ open, setOpen, active, setActive, user, displayName, onLogout }) {
  return <aside className={`sidebar ${open ? 'open' : ''}`}>
    <div className="brand"><div className="brand-mark"><span></span><span></span><span></span></div><strong>learnflow</strong><button className="mobile-close" onClick={() => setOpen(false)}><X size={20}/></button></div>
    <nav>
      <p className="nav-label">Workspace</p>
      {nav.map(([Icon, label]) => <button key={label} className={active === label ? 'active' : ''} onClick={() => {setActive(label); setOpen(false)}}><Icon size={19}/><span>{label}</span>{label === 'Assignments' && <b>5</b>}</button>)}
      <p className="nav-label lower">Manage</p>
      <button onClick={() => setActive('Settings')} className={active === 'Settings' ? 'active' : ''}><Settings size={19}/><span>Settings</span></button>
    </nav>
    <div className="focus-card">
      <div className="focus-icon"><Target size={18}/></div>
      <strong>Weekly focus</strong>
      <p>You're 3h 20m away from your study goal.</p>
      <div className="mini-progress"><span></span></div>
      <small>6h 40m of 10h</small>
    </div>
    <div className="profile"><div className="avatar">{(displayName?.[0] || 'U').toUpperCase()}</div><div><strong>{displayName}</strong><span>{user?.email || 'LearnFlow student'}</span></div><button className="logout-btn" onClick={onLogout} title="Log out">Log out</button></div>
  </aside>
}

function Header({ query, setQuery, setOpen, onNotice }) {
  return <header>
    <button className="menu" onClick={() => setOpen(true)}><Menu size={22}/></button>
    <div className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses, tasks, notes..."/><kbd>⌘ K</kbd></div>
    <div className="header-actions"><button className="icon-btn" onClick={() => onNotice('You have upcoming assignments to review.')} title="Notifications"><Bell size={20}/><i></i></button><button className="add-btn" onClick={() => document.getElementById('addTask').showModal()}><Plus size={18}/> New task</button></div>
  </header>
}

function CourseCard({ course, onOpen }) {
  return <article className="course-card">
    <div className="course-top"><div className="course-icon" style={{background:course.soft,color:course.color}}>{course.icon}</div><button><MoreHorizontal size={20}/></button></div>
    <span className="course-code" style={{color:course.color}}>{course.code}</span>
    <h3>{course.title}</h3><p>{course.instructor}</p>
    <div className="course-next"><span>Up next</span><strong>{course.next}</strong><small>{course.meeting}</small></div>
    <div className="progress-line"><span style={{width:`${course.progress}%`,background:course.color}}></span></div>
    <div className="progress-meta"><span>{course.progress}% complete</span><button onClick={onOpen} style={{color:course.color}}>Open <ArrowUpRight size={14}/></button></div>
  </article>
}

function TaskRow({ task, toggle, remove }) {
  const c = courses.find(x => x.id === task.courseId) || courses[0];
  return <div className={`task-row ${task.done ? 'done' : ''}`}>
    <button className="check" onClick={() => toggle(task.id)}>{task.done && <Check size={14}/>}</button>
    <div className="task-main"><strong>{task.title}</strong><span><i style={{background:c.color}}></i>{task.course}</span></div>
    <div className="task-due"><strong>{task.due}</strong><span>{task.time}</span></div>
    <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
    <button className="task-more" onClick={() => remove(task.id)} title="Remove assignment"><MoreHorizontal size={19}/></button>
  </div>
}

function AddTaskDialog({ addTask }) {
  const [form, setForm] = useState({title:'', courseId:1, due:'Tomorrow', time:'5:00 PM', priority:'Medium'});
  const submit = e => { e.preventDefault(); if (!form.title.trim()) return; const c = courses.find(x => x.id === Number(form.courseId)); addTask({...form, courseId:Number(form.courseId), course:c.code}); e.currentTarget.closest('dialog').close(); setForm({...form,title:''}); };
  return <dialog id="addTask"><form onSubmit={submit}>
    <div className="dialog-head"><div><span className="eyebrow">Stay on track</span><h2>Add a new task</h2></div><button type="button" onClick={() => document.getElementById('addTask').close()}><X/></button></div>
    <label>Task name<input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Finish chapter notes"/></label>
    <div className="form-grid"><label>Course<select value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value})}>{courses.map(c=><option value={c.id} key={c.id}>{c.code} — {c.title}</option>)}</select></label><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label></div>
    <div className="form-grid"><label>Due date<input value={form.due} onChange={e=>setForm({...form,due:e.target.value})}/></label><label>Time<input value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label></div>
    <button className="submit-task"><Plus size={18}/> Add task</button>
  </form></dialog>
}

function WorkspacePage({ active, courses, tasks, query, toggle, remove, displayName, user, onOpenCourse, onNotice }) {
  const matchingCourses = courses.filter(course => `${course.title} ${course.code} ${course.instructor}`.toLowerCase().includes(query.toLowerCase()));
  const matchingTasks = tasks.filter(task => `${task.title} ${task.course}`.toLowerCase().includes(query.toLowerCase()));

  if (active === 'My courses') {
    return <>
      <section className="page-heading"><div><span className="eyebrow">Workspace</span><h1>My courses</h1><p>Keep an eye on every class and your current progress.</p></div><span className="result-count">{matchingCourses.length} courses</span></section>
      <div className="courses-grid workspace-grid">{matchingCourses.map(course => <CourseCard course={course} onOpen={onOpenCourse} key={course.id}/>)}{!matchingCourses.length && <div className="empty">No courses match “{query}”.</div>}</div>
    </>;
  }

  if (active === 'Assignments') {
    return <>
      <section className="page-heading"><div><span className="eyebrow">Workspace</span><h1>Assignments</h1><p>Stay ahead of deadlines and keep your momentum.</p></div><span className="result-count">{matchingTasks.filter(task => !task.done).length} open</span></section>
      <div className="panel full-panel"><div className="task-list workspace-task-list">{matchingTasks.map(task => <TaskRow task={task} toggle={toggle} remove={remove} key={task.id}/>)}{!matchingTasks.length && <div className="empty">No assignments match “{query}”.</div>}</div></div>
    </>;
  }

  if (active === 'Notes') {
    return <>
      <section className="page-heading"><div><span className="eyebrow">Workspace</span><h1>Notes</h1><p>Keep your ideas, reminders, and study notes close by.</p></div><button className="add-btn page-action" onClick={() => onNotice('Note creation will be available in the next update.')}><Plus size={18}/> New note</button></section>
      <div className="notes-grid"><article className="note-card violet"><span>CS 301 · Sep 23</span><h2>Graph traversal patterns</h2><p>Review breadth-first search before tomorrow’s lab. Focus on the queue implementation and visited set.</p></article><article className="note-card peach"><span>MATH 204 · Sep 21</span><h2>Eigenvalue shortcuts</h2><p>Remember to check the characteristic polynomial before expanding the full matrix.</p></article><article className="note-card mint"><span>Personal · Sep 19</span><h2>Study rhythm</h2><p>Two focused 45-minute sessions work better than trying to finish everything in one sitting.</p></article></div>
    </>;
  }

  if (active === 'Progress') {
    const averageProgress = Math.round(courses.reduce((total, course) => total + course.progress, 0) / courses.length);
    return <>
      <section className="page-heading"><div><span className="eyebrow">This semester</span><h1>Your progress</h1><p>See how your learning is building over time.</p></div><span className="result-count">{averageProgress}% average</span></section>
      <div className="progress-layout"><div className="panel progress-summary"><span className="eyebrow">Overall completion</span><strong>{averageProgress}%</strong><p>You are making steady progress across all four courses.</p><div className="progress-line"><span style={{width: `${averageProgress}%`}}></span></div></div><div className="panel course-progress-list"><h2>Course progress</h2>{courses.map(course => <div className="course-progress-row" key={course.id}><span>{course.code}</span><strong>{course.title}</strong><div className="progress-line"><span style={{width: `${course.progress}%`, background: course.color}}></span></div><b>{course.progress}%</b></div>)}</div></div>
    </>;
  }

  return <>
    <section className="page-heading"><div><span className="eyebrow">Manage</span><h1>Settings</h1><p>Personalize your LearnFlow workspace.</p></div></section>
    <div className="panel settings-panel"><div className="profile-page-header"><div className="profile-large-avatar">{displayName[0].toUpperCase()}</div><div><h2>{displayName}</h2><p>{user.email}</p></div></div><label>Display name<input defaultValue={displayName} /></label><label>Study program<input defaultValue="Computer Science" /></label><label className="setting-toggle"><span><strong>Weekly reminders</strong><small>Get a gentle reminder about upcoming work.</small></span><input type="checkbox" defaultChecked /></label><button className="submit-task">Save preferences</button></div>
  </>;
}

function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setMessage('');
    if (password.length < 6) { setMessage('Use a password with at least 6 characters.'); return; }
    setBusy(true);
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name.trim() } } });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === 'signup') setMessage('Account created. Check your email if confirmation is enabled.');
  };

  return <main className="auth-shell"><section className="auth-card"><div className="auth-brand"><div className="brand-mark"><span></span><span></span><span></span></div><strong>learnflow</strong></div><span className="eyebrow">Student learning dashboard</span><h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p>{mode === 'login' ? 'Sign in to continue your learning journey.' : 'Start organizing your courses, tasks, and study goals.'}</p><form onSubmit={submit} className="auth-form">{mode === 'signup' && <label>Your name<input value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Alex Morgan" required /></label>}<label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" required minLength="6" /></label>{message && <p className="auth-message">{message}</p>}<button className="submit-task" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form><button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>{mode === 'login' ? 'New to LearnFlow? Create an account' : 'Already have an account? Sign in'}</button></section></main>;
}

function SetupScreen() {
  return <main className="auth-shell"><section className="auth-card"><div className="auth-brand"><div className="brand-mark"><span></span><span></span><span></span></div><strong>learnflow</strong></div><span className="eyebrow">One setup step remains</span><h1>Connect your account system</h1><p>Add the Supabase values to a local `.env.local` file, then restart the Vite server.</p><pre>VITE_SUPABASE_URL=https://totkgjjbaliukfblaper.supabase.co{`\n`}VITE_SUPABASE_ANON_KEY=your-public-key</pre><p className="setup-note">Find the public key in Supabase: Project Settings → API. Never use or share the service-role key.</p></section></main>;
}

function AuthGate() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);
  if (!isSupabaseConfigured) return <SetupScreen />;
  if (loading) return <main className="auth-shell"><p>Loading your account...</p></main>;
  if (!session) return <AuthScreen />;
  return <App user={session.user} onLogout={() => supabase.auth.signOut()} />;
}

function App({ user, onLogout }) {
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';
  const [tasks, setTasks] = usePersistentTasks(user.id);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sidebar, setSidebar] = useState(false);
  const [active, setActive] = useState('Overview');
  const [notice, setNotice] = useState('');
  const filtered = useMemo(() => tasks.filter(t => !t.done && (filter === 'All' || t.priority === filter) && `${t.title} ${t.course}`.toLowerCase().includes(query.toLowerCase())), [tasks, filter, query]);
  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? {...t, done:!t.done} : t));
  const addTask = data => setTasks(ts => [{...data,id:Date.now(),done:false},...ts]);
  const removeTask = id => setTasks(ts => ts.filter(task => task.id !== id));
  const visibleCourses = courses.filter(c => `${c.title} ${c.code} ${c.instructor}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="app-shell">
    <Sidebar open={sidebar} setOpen={setSidebar} active={active} setActive={setActive} user={user} displayName={displayName} onLogout={onLogout}/>{sidebar && <div className="scrim" onClick={()=>setSidebar(false)}/>} 
    <main><Header query={query} setQuery={setQuery} setOpen={setSidebar} onNotice={setNotice}/>
      {notice && <button className="notice-toast" onClick={() => setNotice('')}>{notice} ×</button>}
      <div className="content">
        {active !== 'Overview' ? <WorkspacePage active={active} courses={courses} tasks={tasks} query={query} toggle={toggle} remove={removeTask} displayName={displayName} user={user} onOpenCourse={() => setActive('My courses')} onNotice={setNotice}/> : <>
        <section className="welcome"><div><span className="eyebrow">Thursday, September 24</span><h1>Good morning, {displayName} <span>👋</span></h1><p>Small steps add up. Here's what needs your attention today.</p></div><div className="streak"><div><Flame size={22}/></div><span><b>12 day</b> study streak</span></div></section>
        <section className="stats-grid">
          <div className="stat-card"><div className="stat-icon purple"><BookOpen/></div><div><span>Active courses</span><strong>4</strong><small><b>2</b> classes today</small></div></div>
          <div className="stat-card"><div className="stat-icon coral"><ClipboardCheck/></div><div><span>Tasks due</span><strong>{tasks.filter(t=>!t.done).length}</strong><small><b>2</b> due this week</small></div></div>
          <div className="stat-card"><div className="stat-icon green"><Clock3/></div><div><span>Study time</span><strong>6h 40m</strong><small><b>+18%</b> from last week</small></div></div>
          <div className="stat-card grade"><div className="stat-icon blue"><BarChart3/></div><div><span>Average grade</span><strong>88.4%</strong><small><b>+2.4%</b> this semester</small></div><svg viewBox="0 0 100 36"><path d="M2 31 C18 29, 20 18, 34 21 S52 28, 63 15 S78 19, 98 3"/><path className="area" d="M2 31 C18 29, 20 18, 34 21 S52 28, 63 15 S78 19, 98 3 L98 36 L2 36Z"/></svg></div>
        </section>
        <section className="section-block"><div className="section-title"><div><h2>Your courses</h2><p>Pick up where you left off</p></div><button className="view-all" onClick={() => setActive('My courses')}>View all <ChevronRight size={17}/></button></div>
          <div className="courses-grid">{visibleCourses.map(c=><CourseCard course={c} onOpen={() => setActive('My courses')} key={c.id}/>)}{visibleCourses.length===0&&<div className="empty">No courses match “{query}”.</div>}</div>
        </section>
        <section className="bottom-grid">
          <div className="assignments panel"><div className="section-title"><div><h2>Upcoming assignments</h2><p>Your next deadlines</p></div><button className="filter-btn" onClick={() => setFilter(filter === 'All' ? 'High' : 'All')}><SlidersHorizontal size={16}/> {filter === 'All' ? 'High priority' : 'Show all'}</button></div>
            <div className="filter-tabs">{['All','High','Medium','Low'].map(f=><button className={filter===f?'active':''} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div>
            <div className="task-list">{filtered.slice(0,5).map(t=><TaskRow task={t} toggle={toggle} remove={removeTask} key={t.id}/>)}{!filtered.length&&<div className="empty"><Check size={25}/> You’re all caught up.</div>}</div>
          </div>
          <aside className="today panel"><div className="section-title"><div><h2>Today's schedule</h2><p>Thursday, Sep 24</p></div><button><CalendarDays size={19}/></button></div>
            <div className="timeline">
              <div className="timeline-item"><time>9:00</time><span style={{background:'#39a48c'}}></span><div><small>PSY 110</small><strong>Cognitive Psychology</strong><em>Room 204 · 60 min</em></div></div>
              <div className="timeline-item active"><time>11:30</time><span style={{background:'#7968e8'}}></span><div><small>FOCUS SESSION</small><strong>Graph Algorithms</strong><em>Library · 90 min</em></div><button><Play size={15} fill="currentColor"/></button></div>
              <div className="timeline-item"><time>2:00</time><span style={{background:'#4379cf'}}></span><div><small>DES 215</small><strong>Interaction Design</strong><em>Studio 3 · 75 min</em></div></div>
            </div>
            <button className="schedule-btn">Open full schedule <ArrowUpRight size={16}/></button>
          </aside>
        </section>
        </>}
      </div>
    </main><AddTaskDialog addTask={addTask}/>
  </div>
}

createRoot(document.getElementById('root')).render(<AuthGate/>);
