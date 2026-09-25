import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutGrid, BookOpen, ClipboardCheck, StickyNote, BarChart3, Settings,
  Search, Bell, Plus, MoreHorizontal, ArrowUpRight, Clock3, CalendarDays,
  Check, ChevronRight, Play, Flame, Target, X, Menu, SlidersHorizontal
} from 'lucide-react';
import './styles.css';

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

function usePersistentTasks() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('learnflow-tasks')) || starterTasks; }
    catch { return starterTasks; }
  });
  useEffect(() => localStorage.setItem('learnflow-tasks', JSON.stringify(tasks)), [tasks]);
  return [tasks, setTasks];
}

function Sidebar({ open, setOpen, active, setActive }) {
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
    <div className="profile"><div className="avatar">MK</div><div><strong>Max Keller</strong><span>Computer Science</span></div><MoreHorizontal size={19}/></div>
  </aside>
}

function Header({ query, setQuery, setOpen }) {
  return <header>
    <button className="menu" onClick={() => setOpen(true)}><Menu size={22}/></button>
    <div className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses, tasks, notes..."/><kbd>⌘ K</kbd></div>
    <div className="header-actions"><button className="icon-btn"><Bell size={20}/><i></i></button><button className="add-btn" onClick={() => document.getElementById('addTask').showModal()}><Plus size={18}/> New task</button></div>
  </header>
}

function CourseCard({ course }) {
  return <article className="course-card">
    <div className="course-top"><div className="course-icon" style={{background:course.soft,color:course.color}}>{course.icon}</div><button><MoreHorizontal size={20}/></button></div>
    <span className="course-code" style={{color:course.color}}>{course.code}</span>
    <h3>{course.title}</h3><p>{course.instructor}</p>
    <div className="course-next"><span>Up next</span><strong>{course.next}</strong><small>{course.meeting}</small></div>
    <div className="progress-line"><span style={{width:`${course.progress}%`,background:course.color}}></span></div>
    <div className="progress-meta"><span>{course.progress}% complete</span><button style={{color:course.color}}>Open <ArrowUpRight size={14}/></button></div>
  </article>
}

function TaskRow({ task, toggle }) {
  const c = courses.find(x => x.id === task.courseId) || courses[0];
  return <div className={`task-row ${task.done ? 'done' : ''}`}>
    <button className="check" onClick={() => toggle(task.id)}>{task.done && <Check size={14}/>}</button>
    <div className="task-main"><strong>{task.title}</strong><span><i style={{background:c.color}}></i>{task.course}</span></div>
    <div className="task-due"><strong>{task.due}</strong><span>{task.time}</span></div>
    <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
    <button className="task-more"><MoreHorizontal size={19}/></button>
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

function WorkspacePage({ active, courses, tasks, query, toggle }) {
  const matchingCourses = courses.filter(course => `${course.title} ${course.code} ${course.instructor}`.toLowerCase().includes(query.toLowerCase()));
  const matchingTasks = tasks.filter(task => `${task.title} ${task.course}`.toLowerCase().includes(query.toLowerCase()));

  if (active === 'My courses') {
    return <>
      <section className="page-heading"><div><span className="eyebrow">Workspace</span><h1>My courses</h1><p>Keep an eye on every class and your current progress.</p></div><span className="result-count">{matchingCourses.length} courses</span></section>
      <div className="courses-grid workspace-grid">{matchingCourses.map(course => <CourseCard course={course} key={course.id}/>)}{!matchingCourses.length && <div className="empty">No courses match “{query}”.</div>}</div>
    </>;
  }

  if (active === 'Assignments') {
    return <>
      <section className="page-heading"><div><span className="eyebrow">Workspace</span><h1>Assignments</h1><p>Stay ahead of deadlines and keep your momentum.</p></div><span className="result-count">{matchingTasks.filter(task => !task.done).length} open</span></section>
      <div className="panel full-panel"><div className="task-list workspace-task-list">{matchingTasks.map(task => <TaskRow task={task} toggle={toggle} key={task.id}/>)}{!matchingTasks.length && <div className="empty">No assignments match “{query}”.</div>}</div></div>
    </>;
  }

  if (active === 'Notes') {
    return <>
      <section className="page-heading"><div><span className="eyebrow">Workspace</span><h1>Notes</h1><p>Keep your ideas, reminders, and study notes close by.</p></div><button className="add-btn page-action"><Plus size={18}/> New note</button></section>
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
    <div className="panel settings-panel"><label>Display name<input defaultValue="Max Keller" /></label><label>Study program<input defaultValue="Computer Science" /></label><label className="setting-toggle"><span><strong>Weekly reminders</strong><small>Get a gentle reminder about upcoming work.</small></span><input type="checkbox" defaultChecked /></label><button className="submit-task">Save preferences</button></div>
  </>;
}

function App() {
  const [tasks, setTasks] = usePersistentTasks();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sidebar, setSidebar] = useState(false);
  const [active, setActive] = useState('Overview');
  const filtered = useMemo(() => tasks.filter(t => !t.done && (filter === 'All' || t.priority === filter) && `${t.title} ${t.course}`.toLowerCase().includes(query.toLowerCase())), [tasks, filter, query]);
  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? {...t, done:!t.done} : t));
  const addTask = data => setTasks(ts => [{...data,id:Date.now(),done:false},...ts]);
  const visibleCourses = courses.filter(c => `${c.title} ${c.code} ${c.instructor}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="app-shell">
    <Sidebar open={sidebar} setOpen={setSidebar} active={active} setActive={setActive}/>{sidebar && <div className="scrim" onClick={()=>setSidebar(false)}/>} 
    <main><Header query={query} setQuery={setQuery} setOpen={setSidebar}/>
      <div className="content">
        {active !== 'Overview' ? <WorkspacePage active={active} courses={courses} tasks={tasks} query={query} toggle={toggle}/> : <>
        <section className="welcome"><div><span className="eyebrow">Thursday, September 24</span><h1>Good morning, Max <span>👋</span></h1><p>Small steps add up. Here's what needs your attention today.</p></div><div className="streak"><div><Flame size={22}/></div><span><b>12 day</b> study streak</span></div></section>
        <section className="stats-grid">
          <div className="stat-card"><div className="stat-icon purple"><BookOpen/></div><div><span>Active courses</span><strong>4</strong><small><b>2</b> classes today</small></div></div>
          <div className="stat-card"><div className="stat-icon coral"><ClipboardCheck/></div><div><span>Tasks due</span><strong>{tasks.filter(t=>!t.done).length}</strong><small><b>2</b> due this week</small></div></div>
          <div className="stat-card"><div className="stat-icon green"><Clock3/></div><div><span>Study time</span><strong>6h 40m</strong><small><b>+18%</b> from last week</small></div></div>
          <div className="stat-card grade"><div className="stat-icon blue"><BarChart3/></div><div><span>Average grade</span><strong>88.4%</strong><small><b>+2.4%</b> this semester</small></div><svg viewBox="0 0 100 36"><path d="M2 31 C18 29, 20 18, 34 21 S52 28, 63 15 S78 19, 98 3"/><path className="area" d="M2 31 C18 29, 20 18, 34 21 S52 28, 63 15 S78 19, 98 3 L98 36 L2 36Z"/></svg></div>
        </section>
        <section className="section-block"><div className="section-title"><div><h2>Your courses</h2><p>Pick up where you left off</p></div><button className="view-all">View all <ChevronRight size={17}/></button></div>
          <div className="courses-grid">{visibleCourses.map(c=><CourseCard course={c} key={c.id}/>)}{visibleCourses.length===0&&<div className="empty">No courses match “{query}”.</div>}</div>
        </section>
        <section className="bottom-grid">
          <div className="assignments panel"><div className="section-title"><div><h2>Upcoming assignments</h2><p>Your next deadlines</p></div><button className="filter-btn"><SlidersHorizontal size={16}/> Filter</button></div>
            <div className="filter-tabs">{['All','High','Medium','Low'].map(f=><button className={filter===f?'active':''} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div>
            <div className="task-list">{filtered.slice(0,5).map(t=><TaskRow task={t} toggle={toggle} key={t.id}/>)}{!filtered.length&&<div className="empty"><Check size={25}/> You’re all caught up.</div>}</div>
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

createRoot(document.getElementById('root')).render(<App/>);
