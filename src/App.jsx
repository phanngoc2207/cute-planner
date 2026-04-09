import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   🌸 CUTE LIFE PLANNER - Kawaii Edition
   ═══════════════════════════════════════════════════════════════ */

// ── Palette ──────────────────────────────────────────────────────
const C = {
  bg: "#FFF7F0", bgSoft: "#FFF1E8",
  card: "#FFFFFF", cardAlt: "#FFFAF6",
  pink: "#FF85A1", pinkLight: "#FFD1DC", pinkSoft: "#FFF0F3", pinkDark: "#E8607A",
  lav: "#B8A9D4", lavLight: "#E4DAEF", lavSoft: "#F5F0FA",
  mint: "#7ECEC1", mintLight: "#C5EDE7", mintSoft: "#EEFAF7",
  peach: "#FFB088", peachLight: "#FFD9C4", peachSoft: "#FFF3EC",
  sky: "#82C4E0", skyLight: "#C8E6F5",
  yellow: "#FFD770", yellowLight: "#FFF2CC", yellowSoft: "#FFFCF0",
  coral: "#FF8A7A", coralLight: "#FFD0C9",
  rose: "#E891A8",
  text: "#4A3728", textSub: "#8B7B6B", textMuted: "#C4B0A0",
  border: "#F0E4DA", borderLight: "#F8F0E8",
  shadow: "0 4px 16px rgba(160,130,110,0.08)",
};

const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().slice(0, 10);
const dayNamesS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const dayNamesF = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function weekDates() {
  const n = new Date(), d = n.getDay(), diff = n.getDate() - d + (d === 0 ? -6 : 1);
  const m = new Date(new Date(n).setDate(diff));
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(m); x.setDate(m.getDate() + i); return x.toISOString().slice(0, 10); });
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return { t: "Chào buổi sáng", e: "🌸", s: "Bắt đầu ngày mới thật xinh nha~" };
  if (h < 18) return { t: "Chào buổi chiều", e: "🌻", s: "Cố lên, sắp xong rồi!" };
  return { t: "Buổi tối rồi", e: "🌙", s: "Nghỉ ngơi thôi nè~" };
}

/* ── Storage Hook ─────────────────────────────────────────────── */
function useStore(key, init) {
  const [s, setS] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : init;
    } catch { return init; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(s)); } catch {}
  }, [s, key]);
  return [s, setS];
}

/* ── Inject global styles ─────────────────────────────────────── */
const SID = "kawaii-css-v4";
if (typeof document !== "undefined" && !document.getElementById(SID)) {
  const el = document.createElement("style"); el.id = SID;
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Patrick+Hand&display=swap');
    @keyframes floatUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pop{0%{transform:scale(.85);opacity:0}70%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
    @keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(255,133,161,.25)}50%{box-shadow:0 0 18px rgba(255,133,161,.45)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    .fIn{animation:floatUp .45s ease both}.pop{animation:pop .35s ease both}
    .wig:active{animation:wiggle .3s ease}
    input:focus,textarea:focus{outline:none!important;border-color:${C.pink}!important;box-shadow:0 0 0 3px ${C.pinkLight}!important}
    input::placeholder,textarea::placeholder{color:${C.textMuted}}
    ::-webkit-scrollbar{width:0}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    .cute-btn{border:none;border-radius:14px;font-weight:700;cursor:pointer;font-family:'Quicksand',sans-serif;transition:all .2s;font-size:14px}
    .cute-btn:active{transform:scale(.96)}
  `;
  document.head.appendChild(el);
}

/* ── Default data ─────────────────────────────────────────────── */
const DEF = {
  habits: [
    { id: uid(), name: "Uống 2L nước", icon: "💧", streak: 3, log: {} },
    { id: uid(), name: "Đọc sách 30 phút", icon: "📖", streak: 1, log: {} },
    { id: uid(), name: "Tập thể dục", icon: "🏃‍♀️", streak: 5, log: {} },
  ],
  todos: [
    { id: uid(), text: "Hoàn thành chương 3 luận văn", done: false, pri: "high" },
    { id: uid(), text: "Gửi email cho thầy hướng dẫn", done: false, pri: "med" },
  ],
  schedule: [
    { id: uid(), title: "Lớp Lão khoa", time: "07:30", end: "09:30", day: 1, color: C.pink, type: "weekly" },
    { id: uid(), title: "Trực bệnh viện", time: "13:00", end: "17:00", day: 2, color: C.mint, type: "weekly" },
    { id: uid(), title: "Seminar TBS", time: "09:00", end: "11:00", day: 4, color: C.lav, type: "weekly" },
  ],
  reminders: [
    { id: uid(), text: "Nộp đề cương nghiên cứu", dt: "2026-04-15T09:00", done: false },
  ],
  quotes: [
    { id: uid(), text: "Không có gì là không thể, chỉ là chưa tìm ra cách thôi~", emoji: "🌟" },
    { id: uid(), text: "Mỗi ngày là cơ hội mới để trở nên tốt hơn.", emoji: "🌱" },
    { id: uid(), text: "Đừng quên yêu thương chính mình nhé!", emoji: "💖" },
  ],
  weight: [
    { id: uid(), date: "2026-04-01", kg: 52 },
    { id: uid(), date: "2026-04-05", kg: 51.5 },
    { id: uid(), date: "2026-04-10", kg: 51.8 },
  ],
  period: { cycleLen: 28, periodLen: 5, lastStart: "2026-03-20", logs: {} },
};

/* ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState("home");
  const [data, setData] = useStore("kawaii-planner-v4", DEF);
  const g = greet();
  const td = todayStr();
  const wk = weekDates();
  const upd = (k, fn) => setData(d => ({ ...d, [k]: typeof fn === "function" ? fn(d[k]) : fn }));

  /* ── Shared UI atoms ──────────────────────────────────────── */
  const Card = ({ children, style: sx, delay = 0, className = "", onClick }) => (
    <div className={`fIn ${className}`} style={{ background: C.card, borderRadius: 20, padding: 16, boxShadow: C.shadow, border: `1px solid ${C.borderLight}`, animationDelay: `${delay}ms`, ...sx }} onClick={onClick}>{children}</div>
  );
  const Badge = ({ children, bg, color }) => (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: bg, color }}>{children}</span>
  );
  const Input = (props) => (
    <input {...props} style={{ width: "100%", background: C.cardAlt, border: `2px solid ${C.border}`, borderRadius: 14, padding: "11px 14px", fontSize: 15, color: C.text, fontFamily: "'Quicksand',sans-serif", ...props.style }} />
  );
  const AddRow = ({ label, onClick }) => (
    <button onClick={onClick} className="cute-btn" style={{ width: "100%", background: "transparent", border: `2px dashed ${C.border}`, borderRadius: 16, padding: 16, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>+</span> {label}
    </button>
  );

  /* ═══════════════════════════════════════════════════════════
     🏠 HOME TAB
     ═══════════════════════════════════════════════════════════ */
  const Home = () => {
    const completedH = data.habits.filter(h => h.log[td]).length;
    const totalH = data.habits.length;
    const pct = totalH ? Math.round(completedH / totalH * 100) : 0;
    const pendingT = data.todos.filter(t => !t.done).length;
    const rq = data.quotes.length ? data.quotes[Math.floor(Math.random() * data.quotes.length)] : null;
    // Period info
    const pInfo = periodInfo(data.period);

    return (
      <div style={{ padding: "0 18px 110px" }}>
        {/* Greeting */}
        <div className="fIn" style={{ padding: "22px 0 8px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 42, animation: "float 3s ease infinite" }}>{g.e}</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{g.t}!</div>
            <div style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>{g.s}</div>
          </div>
        </div>

        {/* Quote */}
        {rq && (
          <Card delay={80} style={{ background: `linear-gradient(135deg, ${C.pinkSoft}, ${C.yellowSoft}, ${C.mintSoft})`, marginTop: 14, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -10, right: -6, fontSize: 52, opacity: 0.15 }}>{rq.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.pink, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>✨ Câu nói hay</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.6, fontFamily: "'Patrick Hand', cursive", position: "relative" }}>"{rq.text}"</div>
          </Card>
        )}

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
          <Card delay={120} style={{ textAlign: "center", cursor: "pointer" }} className="fIn wig" onClick={() => setTab("habit")}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🌸</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.pink }}>{pct}%</div>
            <div style={{ fontSize: 11, color: C.textSub, fontWeight: 600 }}>Thói quen hôm nay</div>
          </Card>
          <Card delay={160} style={{ textAlign: "center", cursor: "pointer" }} className="fIn wig" onClick={() => setTab("todo")}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>📝</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.peach }}>{pendingT}</div>
            <div style={{ fontSize: 11, color: C.textSub, fontWeight: 600 }}>Việc cần làm</div>
          </Card>
          <Card delay={200} style={{ textAlign: "center", cursor: "pointer" }} className="fIn wig" onClick={() => setTab("weight")}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>⚖️</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.mint }}>{data.weight.length ? data.weight[data.weight.length - 1].kg : "—"}<span style={{ fontSize: 14 }}>kg</span></div>
            <div style={{ fontSize: 11, color: C.textSub, fontWeight: 600 }}>Cân nặng</div>
          </Card>
          <Card delay={240} style={{ textAlign: "center", cursor: "pointer" }} className="fIn wig" onClick={() => setTab("period")}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🩸</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.rose }}>{pInfo.label}</div>
            <div style={{ fontSize: 11, color: C.textSub, fontWeight: 600 }}>{pInfo.sub}</div>
          </Card>
        </div>

        {/* Today's schedule peek */}
        {(() => {
          const todayDay = new Date().getDay();
          const todaySch = data.schedule.filter(s => s.day === todayDay).sort((a, b) => a.time.localeCompare(b.time));
          if (!todaySch.length) return null;
          return (
            <Card delay={280} style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.lav, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>📅 Lịch hôm nay</div>
              {todaySch.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textSub, fontFamily: "monospace", minWidth: 42 }}>{s.time}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.title}</div>
                </div>
              ))}
            </Card>
          );
        })()}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     🌸 HABIT TAB
     ═══════════════════════════════════════════════════════════ */
  const Habits = () => {
    const [adding, setAdding] = useState(false);
    const [nn, setNn] = useState(""); const [ni, setNi] = useState("✨");
    const td2 = td;

    const toggle = id => upd("habits", hs => hs.map(h => {
      if (h.id !== id) return h;
      const done = !h.log[td2]; const log = { ...h.log, [td2]: done };
      let st = 0, d = new Date();
      while (log[d.toISOString().slice(0, 10)]) { st++; d.setDate(d.getDate() - 1); }
      return { ...h, log, streak: st };
    }));
    const del = id => upd("habits", hs => hs.filter(h => h.id !== id));
    const add = () => { if (!nn.trim()) return; upd("habits", hs => [...hs, { id: uid(), name: nn, icon: ni, streak: 0, log: {} }]); setNn(""); setNi("✨"); setAdding(false); };

    const done = data.habits.filter(h => h.log[td2]).length, total = data.habits.length;
    const pct = total ? Math.round(done / total * 100) : 0;

    return (
      <div style={{ padding: "0 18px 110px" }}>
        {/* Progress */}
        <Card style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 18, background: `linear-gradient(135deg, ${C.pinkSoft}, ${C.peachSoft})` }}>
          <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
            <svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" fill="none" stroke={C.pinkLight} strokeWidth="7" /><circle cx="36" cy="36" r="30" fill="none" stroke={C.pink} strokeWidth="7" strokeDasharray={`${pct / 100 * 188.5} 188.5`} strokeLinecap="round" transform="rotate(-90 36 36)" style={{ transition: "all .6s ease" }} /></svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: C.pink }}>{pct}%</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Thói quen</div>
            <div style={{ fontSize: 13, color: C.textSub }}>{done}/{total} hoàn thành hôm nay 🎉</div>
          </div>
        </Card>

        {/* Week strip */}
        <div style={{ display: "flex", gap: 5, margin: "16px 0", justifyContent: "space-between" }}>
          {wk.map((d, i) => {
            const isT = d === td2;
            const allDone = data.habits.length > 0 && data.habits.every(h => h.log[d]);
            return (
              <div key={d} style={{ flex: 1, textAlign: "center", padding: "7px 0", borderRadius: 14, background: isT ? C.pink : C.card, border: isT ? "none" : `1.5px solid ${C.border}`, transition: "all .2s" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isT ? "#fff" : C.textMuted }}>{dayNamesS[(i + 1) % 7]}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: isT ? "#fff" : C.text, marginTop: 1 }}>{+d.slice(8)}</div>
                {allDone && <div style={{ width: 5, height: 5, borderRadius: "50%", background: isT ? "#fff" : C.mint, margin: "3px auto 0" }} />}
              </div>
            );
          })}
        </div>

        {/* Habits list */}
        {data.habits.map((h, idx) => {
          const d = !!h.log[td2];
          return (
            <Card key={h.id} delay={idx * 60} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10, background: d ? C.mintSoft : C.card, border: d ? `2px solid ${C.mintLight}` : `1.5px solid ${C.borderLight}`, cursor: "pointer", padding: 14 }} onClick={() => toggle(h.id)}>
              <div style={{ fontSize: 28, width: 40, textAlign: "center" }}>{h.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{h.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>🔥 {h.streak} ngày liên tiếp</div>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: 10, background: d ? `linear-gradient(135deg, ${C.mint}, ${C.sky})` : "transparent", border: d ? "none" : `2.5px solid ${C.textMuted}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .25s" }}>
                {d && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <div onClick={e => { e.stopPropagation(); del(h.id); }} style={{ color: C.textMuted, cursor: "pointer", padding: 4, fontSize: 14 }}>✕</div>
            </Card>
          );
        })}

        {adding ? (
          <Card style={{ border: `2px solid ${C.pinkLight}` }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <Input value={ni} onChange={e => setNi(e.target.value)} style={{ width: 52, textAlign: "center", fontSize: 24, padding: 8 }} />
              <Input value={nn} onChange={e => setNn(e.target.value)} placeholder="Tên thói quen..." autoFocus onKeyDown={e => e.key === "Enter" && add()} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="cute-btn" onClick={add} style={{ flex: 1, background: `linear-gradient(135deg, ${C.pink}, ${C.peach})`, color: "#fff", padding: "11px 0", boxShadow: `0 3px 12px ${C.pinkLight}` }}>Thêm 🌸</button>
              <button className="cute-btn" onClick={() => setAdding(false)} style={{ flex: 1, background: C.cardAlt, color: C.textSub, padding: "11px 0" }}>Huỷ</button>
            </div>
          </Card>
        ) : <AddRow label="Thêm thói quen mới" onClick={() => setAdding(true)} />}

        {/* 30-day tracker */}
        {data.habits.length > 0 && (() => {
          const days30 = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (29 - i));
            return d.toISOString().slice(0, 10);
          });
          return (
            <Card style={{ marginTop: 14, marginBottom: 4, padding: "14px 14px 10px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>📊 Tracker 30 ngày</div>
              {data.habits.map(h => {
                const count = days30.filter(d => h.log[d]).length;
                const pctH = Math.round(count / 30 * 100);
                return (
                  <div key={h.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                      <span style={{ fontSize: 13 }}>{h.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.textSub, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</span>
                      <span style={{ fontSize: 10, color: pctH >= 70 ? C.mint : pctH >= 40 ? C.peach : C.textMuted, fontWeight: 700 }}>{count}/30</span>
                    </div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {days30.map((d, idx) => {
                        const done = !!h.log[d];
                        const isT = d === td2;
                        return (
                          <div key={idx} style={{
                            flex: 1, height: 18, borderRadius: 3,
                            background: done ? `linear-gradient(135deg, ${C.pink}CC, ${C.peach}CC)` : C.borderLight,
                            border: isT ? `1.5px solid ${C.pink}` : "1.5px solid transparent",
                          }} />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: 9, color: C.textMuted }}>← 30 ngày trước</span>
                <span style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, color: C.pink }}>Hôm nay →</span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textMuted }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: `linear-gradient(135deg, ${C.pink}CC, ${C.peach}CC)` }} /> Hoàn thành
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.textMuted }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: C.borderLight, border: `1px solid ${C.border}` }} /> Bỏ qua
                </div>
              </div>
            </Card>
          );
        })()}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     📝 TODO TAB
     ═══════════════════════════════════════════════════════════ */
  const Todos = () => {
    const [adding, setAdding] = useState(false);
    const [nt, setNt] = useState(""); const [np, setNp] = useState("med");
    const toggle = id => upd("todos", ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
    const del = id => upd("todos", ts => ts.filter(t => t.id !== id));
    const add = () => { if (!nt.trim()) return; upd("todos", ts => [...ts, { id: uid(), text: nt, done: false, pri: np }]); setNt(""); setAdding(false); };

    const priC = { high: { bg: C.coralLight, c: C.coral, l: "Cao" }, med: { bg: C.yellowLight, c: "#D4A017", l: "TB" }, low: { bg: C.mintLight, c: C.mint, l: "Thấp" } };
    const pending = data.todos.filter(t => !t.done), completed = data.todos.filter(t => t.done);

    return (
      <div style={{ padding: "0 18px 110px" }}>
        <div className="fIn" style={{ padding: "16px 0 12px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>📝 Việc cần làm</div>
          <div style={{ fontSize: 13, color: C.textSub }}>{pending.length} việc chưa xong</div>
        </div>

        {pending.map((t, i) => (
          <Card key={t.id} delay={i * 50} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, padding: 14 }}>
            <div onClick={() => toggle(t.id)} style={{ width: 26, height: 26, borderRadius: 9, border: `2.5px solid ${C.textMuted}`, cursor: "pointer", flexShrink: 0, transition: "all .2s" }} />
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.text }}>{t.text}</div>
            <Badge bg={priC[t.pri].bg} color={priC[t.pri].c}>{priC[t.pri].l}</Badge>
            <div onClick={() => del(t.id)} style={{ color: C.textMuted, cursor: "pointer", fontSize: 13 }}>✕</div>
          </Card>
        ))}

        {completed.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>✅ Đã xong ({completed.length})</div>
            {completed.map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.cardAlt, borderRadius: 16, marginBottom: 6, opacity: .55 }}>
                <div onClick={() => toggle(t.id)} style={{ width: 24, height: 24, borderRadius: 8, background: `linear-gradient(135deg, ${C.mint}, ${C.sky})`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div style={{ flex: 1, fontSize: 14, color: C.textMuted, textDecoration: "line-through" }}>{t.text}</div>
                <div onClick={() => del(t.id)} style={{ color: C.textMuted, cursor: "pointer", fontSize: 13 }}>✕</div>
              </div>
            ))}
          </div>
        )}

        {adding ? (
          <Card style={{ marginTop: 10, border: `2px solid ${C.pinkLight}` }}>
            <Input value={nt} onChange={e => setNt(e.target.value)} placeholder="Nhập công việc..." autoFocus onKeyDown={e => e.key === "Enter" && add()} style={{ marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["high", "med", "low"].map(p => (
                <button key={p} className="cute-btn" onClick={() => setNp(p)} style={{ flex: 1, padding: "8px 0", background: np === p ? priC[p].bg : C.cardAlt, color: np === p ? priC[p].c : C.textMuted, border: np === p ? `2px solid ${priC[p].c}40` : `2px solid ${C.border}`, borderRadius: 10, fontSize: 13 }}>{priC[p].l}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="cute-btn" onClick={add} style={{ flex: 1, background: `linear-gradient(135deg, ${C.pink}, ${C.peach})`, color: "#fff", padding: "11px 0", boxShadow: `0 3px 12px ${C.pinkLight}` }}>Thêm 📝</button>
              <button className="cute-btn" onClick={() => setAdding(false)} style={{ flex: 1, background: C.cardAlt, color: C.textSub, padding: "11px 0" }}>Huỷ</button>
            </div>
          </Card>
        ) : <div style={{ marginTop: 8 }}><AddRow label="Thêm việc mới" onClick={() => setAdding(true)} /></div>}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     📅 SCHEDULE TAB — Monthly calendar + day events
     ═══════════════════════════════════════════════════════════ */
  const Schedule = () => {
    const now = new Date();
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());
    const [selDate, setSelDate] = useState(td);
    const [adding, setAdding] = useState(false);
    const [nt, setNt] = useState("");
    const [nT, setNT] = useState("08:00"); const [nE, setNE] = useState("09:00");
    const [nType, setNType] = useState("weekly");
    const [nD, setND] = useState(1);
    const [nDate, setNDate] = useState(td);
    const [nC, setNC] = useState(C.pink);
    const colors = [C.pink, C.mint, C.lav, C.peach, C.sky, C.coral];

    const del = id => upd("schedule", s => s.filter(x => x.id !== id));
    const add = () => {
      if (!nt.trim()) return;
      const ev = { id: uid(), title: nt, time: nT, end: nE, color: nC, type: nType };
      if (nType === "weekly") ev.day = nD; else ev.date = nDate;
      upd("schedule", s => [...s, ev]);
      setNt(""); setAdding(false);
    };

    // Events for a given date string
    const getEvents = (dateStr) => {
      const dow = new Date(dateStr + "T12:00:00").getDay();
      const weekly = data.schedule.filter(e => (e.type === "weekly" || !e.type) && e.day === dow);
      const once = data.schedule.filter(e => e.type === "once" && e.date === dateStr);
      return [...weekly, ...once].sort((a, b) => a.time.localeCompare(b.time));
    };

    // Calendar grid (Mon-first)
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const offset = firstDow === 0 ? 6 : firstDow - 1;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const calDays = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const hasEv = (d) => {
      const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      return getEvents(ds).length > 0;
    };

    const prevM = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); };
    const nextM = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); };

    const selEvents = getEvents(selDate);
    const selLabel = new Date(selDate + "T12:00:00").toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });

    return (
      <div style={{ padding: "0 18px 110px" }}>
        <div className="fIn" style={{ padding: "16px 0 12px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>📅 Lịch</div>
          <div style={{ fontSize: 13, color: C.textSub }}>Chạm vào ngày để xem sự kiện</div>
        </div>

        {/* Monthly calendar */}
        <Card style={{ padding: "14px 12px" }}>
          {/* Month nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <button className="cute-btn" onClick={prevM} style={{ padding: "6px 16px", background: C.cardAlt, color: C.text, fontSize: 18, lineHeight: 1 }}>‹</button>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Tháng {viewMonth + 1}/{viewYear}</div>
            <button className="cute-btn" onClick={nextM} style={{ padding: "6px 16px", background: C.cardAlt, color: C.text, fontSize: 18, lineHeight: 1 }}>›</button>
          </div>
          {/* Day-of-week headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 6 }}>
            {["T2","T3","T4","T5","T6","T7","CN"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: C.textMuted, padding: "2px 0" }}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
            {calDays.map((d, i) => {
              if (!d) return <div key={`e${i}`} />;
              const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const isToday = ds === td;
              const isSel = ds === selDate;
              const ev = hasEv(d);
              return (
                <div key={i} onClick={() => setSelDate(ds)} style={{
                  textAlign: "center", padding: "7px 2px 5px", borderRadius: 11, cursor: "pointer",
                  background: isSel ? C.pink : isToday ? C.pinkSoft : "transparent",
                  border: isToday && !isSel ? `2px solid ${C.pinkLight}` : "2px solid transparent",
                  transition: "all .15s",
                }}>
                  <div style={{ fontSize: 13, fontWeight: isSel || isToday ? 800 : 500, color: isSel ? "#fff" : isToday ? C.pink : C.text, lineHeight: 1 }}>{d}</div>
                  <div style={{ height: 5, display: "flex", justifyContent: "center", alignItems: "center", marginTop: 2 }}>
                    {ev && <div style={{ width: 4, height: 4, borderRadius: "50%", background: isSel ? "rgba(255,255,255,.8)" : C.pink }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected day panel */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.pink, textTransform: "capitalize" }}>{selLabel}{selDate === td && " ✨"}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{selEvents.length} sự kiện</div>
            </div>
            <button className="cute-btn" onClick={() => { setNDate(selDate); setAdding(true); }} style={{ padding: "7px 14px", background: C.pinkSoft, color: C.pink, border: `1.5px solid ${C.pinkLight}`, fontSize: 12 }}>+ Thêm</button>
          </div>

          {selEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0 10px", color: C.textMuted }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>📭</div>
              <div style={{ fontSize: 13 }}>Không có sự kiện nào</div>
            </div>
          ) : selEvents.map((s, i) => (
            <Card key={s.id} delay={i * 40} style={{ display: "flex", gap: 12, marginBottom: 8, padding: "12px 14px", borderLeft: `5px solid ${s.color}` }}>
              <div style={{ minWidth: 50 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "monospace" }}>{s.time}</div>
                <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "monospace" }}>{s.end}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.title}</div>
                {(s.type === "weekly" || !s.type) && <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>🔁 Lặp hàng tuần</div>}
              </div>
              <div onClick={() => del(s.id)} style={{ color: C.textMuted, cursor: "pointer", fontSize: 13 }}>✕</div>
            </Card>
          ))}
        </div>

        {/* Add form */}
        {adding && (
          <Card style={{ border: `2px solid ${C.pinkLight}`, marginTop: 8 }}>
            <Input value={nt} onChange={e => setNt(e.target.value)} placeholder="Tên sự kiện..." autoFocus style={{ marginBottom: 10 }} onKeyDown={e => e.key === "Enter" && add()} />
            {/* Type toggle */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[{ k: "weekly", l: "🔁 Hàng tuần" }, { k: "once", l: "📅 Một lần" }].map(x => (
                <button key={x.k} className="cute-btn" onClick={() => setNType(x.k)} style={{ flex: 1, padding: "8px 0", fontSize: 12, background: nType === x.k ? C.pinkSoft : C.cardAlt, color: nType === x.k ? C.pink : C.textSub, border: nType === x.k ? `2px solid ${C.pinkLight}` : `2px solid ${C.border}`, borderRadius: 10 }}>{x.l}</button>
              ))}
            </div>
            {/* Weekly: pick day / Once: pick date */}
            {nType === "weekly" ? (
              <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6, 0].map(d => (
                  <button key={d} className="cute-btn" onClick={() => setND(d)} style={{ padding: "6px 10px", background: nD === d ? C.pinkSoft : C.cardAlt, color: nD === d ? C.pink : C.textSub, border: nD === d ? `2px solid ${C.pinkLight}` : `2px solid ${C.border}`, borderRadius: 10, fontSize: 11 }}>{dayNamesF[d].replace("Thứ ", "T")}</button>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600 }}>Ngày cụ thể</div>
                <input type="date" value={nDate} onChange={e => setNDate(e.target.value)} style={{ width: "100%", background: C.cardAlt, border: `2px solid ${C.border}`, borderRadius: 12, color: C.text, padding: "8px 10px", fontSize: 14, fontFamily: "'Quicksand',sans-serif" }} />
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600 }}>Bắt đầu</div>
                <input type="time" value={nT} onChange={e => setNT(e.target.value)} style={{ width: "100%", background: C.cardAlt, border: `2px solid ${C.border}`, borderRadius: 12, color: C.text, padding: "8px 10px", fontSize: 14, fontFamily: "'Quicksand',sans-serif" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600 }}>Kết thúc</div>
                <input type="time" value={nE} onChange={e => setNE(e.target.value)} style={{ width: "100%", background: C.cardAlt, border: `2px solid ${C.border}`, borderRadius: 12, color: C.text, padding: "8px 10px", fontSize: 14, fontFamily: "'Quicksand',sans-serif" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
              {colors.map(c => <div key={c} onClick={() => setNC(c)} style={{ width: 30, height: 30, borderRadius: 10, background: c, cursor: "pointer", border: nC === c ? "3px solid #fff" : "3px solid transparent", boxShadow: nC === c ? `0 0 0 2px ${c}` : "none" }} />)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="cute-btn" onClick={add} style={{ flex: 1, background: `linear-gradient(135deg, ${C.pink}, ${C.peach})`, color: "#fff", padding: "11px 0" }}>Thêm 📅</button>
              <button className="cute-btn" onClick={() => setAdding(false)} style={{ flex: 1, background: C.cardAlt, color: C.textSub, padding: "11px 0" }}>Huỷ</button>
            </div>
          </Card>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     🔔 REMINDERS TAB
     ═══════════════════════════════════════════════════════════ */
  const Reminders = () => {
    const [adding, setAdding] = useState(false);
    const [nt, setNt] = useState(""); const [ndt, setNdt] = useState("");
    const toggle = id => upd("reminders", rs => rs.map(r => r.id === id ? { ...r, done: !r.done } : r));
    const del = id => upd("reminders", rs => rs.filter(r => r.id !== id));
    const add = () => { if (!nt.trim() || !ndt) return; upd("reminders", rs => [...rs, { id: uid(), text: nt, dt: ndt, done: false }]); setNt(""); setNdt(""); setAdding(false); };

    const fmt = dt => { if (!dt) return ""; const d = new Date(dt); return d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" }) + " · " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }); };
    const overdue = dt => new Date(dt) < new Date();
    const upcoming = data.reminders.filter(r => !r.done).sort((a, b) => a.dt.localeCompare(b.dt));
    const done = data.reminders.filter(r => r.done);

    return (
      <div style={{ padding: "0 18px 110px" }}>
        <div className="fIn" style={{ padding: "16px 0 12px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>🔔 Nhắc nhở</div>
          <div style={{ fontSize: 13, color: C.textSub }}>{upcoming.length} nhắc nhở sắp tới</div>
        </div>

        {upcoming.map((r, i) => {
          const od = overdue(r.dt);
          return (
            <Card key={r.id} delay={i * 50} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, padding: 14, border: od ? `2px solid ${C.coralLight}` : `1.5px solid ${C.borderLight}` }}>
              <div onClick={() => toggle(r.id)} style={{ width: 26, height: 26, borderRadius: 9, border: `2.5px solid ${od ? C.coral : C.textMuted}`, cursor: "pointer", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{r.text}</div>
                <div style={{ fontSize: 11, color: od ? C.coral : C.textMuted, marginTop: 3 }}>🕐 {fmt(r.dt)}{od ? " · Quá hạn!" : ""}</div>
              </div>
              <div onClick={() => del(r.id)} style={{ color: C.textMuted, cursor: "pointer", fontSize: 13 }}>✕</div>
            </Card>
          );
        })}

        {done.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>✅ Đã xong ({done.length})</div>
            {done.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.cardAlt, borderRadius: 16, marginBottom: 6, opacity: .5 }}>
                <div onClick={() => toggle(r.id)} style={{ width: 24, height: 24, borderRadius: 8, background: `linear-gradient(135deg, ${C.mint}, ${C.sky})`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div style={{ flex: 1, fontSize: 14, color: C.textMuted, textDecoration: "line-through" }}>{r.text}</div>
                <div onClick={() => del(r.id)} style={{ color: C.textMuted, cursor: "pointer", fontSize: 13 }}>✕</div>
              </div>
            ))}
          </div>
        )}

        {adding ? (
          <Card style={{ marginTop: 10, border: `2px solid ${C.pinkLight}` }}>
            <Input value={nt} onChange={e => setNt(e.target.value)} placeholder="Nội dung nhắc nhở..." autoFocus style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600 }}>Ngày & giờ</div>
            <input type="datetime-local" value={ndt} onChange={e => setNdt(e.target.value)} style={{ width: "100%", background: C.cardAlt, border: `2px solid ${C.border}`, borderRadius: 14, color: C.text, padding: "10px 12px", fontSize: 14, fontFamily: "'Quicksand',sans-serif", marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="cute-btn" onClick={add} style={{ flex: 1, background: `linear-gradient(135deg, ${C.pink}, ${C.peach})`, color: "#fff", padding: "11px 0" }}>Thêm 🔔</button>
              <button className="cute-btn" onClick={() => setAdding(false)} style={{ flex: 1, background: C.cardAlt, color: C.textSub, padding: "11px 0" }}>Huỷ</button>
            </div>
          </Card>
        ) : <div style={{ marginTop: 8 }}><AddRow label="Thêm nhắc nhở" onClick={() => setAdding(true)} /></div>}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     💬 QUOTES TAB
     ═══════════════════════════════════════════════════════════ */
  const Quotes = () => {
    const [adding, setAdding] = useState(false);
    const [nt, setNt] = useState(""); const [ne, setNe] = useState("🌟");
    const emojiPick = ["🌟", "💖", "🌈", "🦋", "🔥", "🌻", "✨", "🌸", "🍀", "💪", "🎯", "🌙"];

    const add = () => { if (!nt.trim()) return; upd("quotes", qs => [...qs, { id: uid(), text: nt, emoji: ne }]); setNt(""); setNe("🌟"); setAdding(false); };
    const del = id => upd("quotes", qs => qs.filter(q => q.id !== id));

    return (
      <div style={{ padding: "0 18px 110px" }}>
        <div className="fIn" style={{ padding: "16px 0 12px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>💬 Quotes động lực</div>
          <div style={{ fontSize: 13, color: C.textSub }}>Bộ sưu tập câu nói truyền cảm hứng ✨</div>
        </div>

        {data.quotes.map((q, i) => (
          <Card key={q.id} delay={i * 70} style={{ marginBottom: 12, background: i % 3 === 0 ? `linear-gradient(135deg, ${C.pinkSoft}, ${C.peachSoft})` : i % 3 === 1 ? `linear-gradient(135deg, ${C.lavSoft}, ${C.skyLight}40)` : `linear-gradient(135deg, ${C.mintSoft}, ${C.yellowSoft})`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -8, right: -4, fontSize: 56, opacity: .12 }}>{q.emoji}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text, lineHeight: 1.7, fontFamily: "'Patrick Hand', cursive", position: "relative" }}>
              <span style={{ fontSize: 22, color: C.pink, marginRight: 4 }}>"</span>
              {q.text}
              <span style={{ fontSize: 22, color: C.pink, marginLeft: 4 }}>"</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <div style={{ fontSize: 22 }}>{q.emoji}</div>
              <div onClick={() => del(q.id)} style={{ color: C.textMuted, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Xoá</div>
            </div>
          </Card>
        ))}

        {adding ? (
          <Card style={{ border: `2px solid ${C.pinkLight}` }}>
            <textarea value={nt} onChange={e => setNt(e.target.value)} placeholder="Viết câu quote của bạn..." rows={3} autoFocus
              style={{ width: "100%", background: C.cardAlt, border: `2px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", fontSize: 15, color: C.text, fontFamily: "'Patrick Hand', cursive", resize: "none", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {emojiPick.map(e => (
                <div key={e} onClick={() => setNe(e)} style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer", background: ne === e ? C.pinkSoft : C.cardAlt, border: ne === e ? `2px solid ${C.pink}` : `2px solid ${C.border}` }}>{e}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="cute-btn" onClick={add} style={{ flex: 1, background: `linear-gradient(135deg, ${C.pink}, ${C.peach})`, color: "#fff", padding: "11px 0" }}>Thêm 💬</button>
              <button className="cute-btn" onClick={() => setAdding(false)} style={{ flex: 1, background: C.cardAlt, color: C.textSub, padding: "11px 0" }}>Huỷ</button>
            </div>
          </Card>
        ) : <AddRow label="Thêm quote mới" onClick={() => setAdding(true)} />}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     ⚖️ WEIGHT TRACKER
     ═══════════════════════════════════════════════════════════ */
  const Weight = () => {
    const [adding, setAdding] = useState(false);
    const [nk, setNk] = useState(""); const [nd, setNd] = useState(td);
    const sorted = [...data.weight].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const diff = latest && prev ? (latest.kg - prev.kg).toFixed(1) : null;

    const add = () => {
      const kg = parseFloat(nk); if (isNaN(kg) || kg < 20 || kg > 300) return;
      upd("weight", ws => [...ws, { id: uid(), date: nd, kg }]); setNk(""); setAdding(false);
    };
    const del = id => upd("weight", ws => ws.filter(w => w.id !== id));

    // Simple SVG chart
    const chartW = 340, chartH = 150, pad = 30;
    const last10 = sorted.slice(-10);
    const minKg = last10.length ? Math.min(...last10.map(w => w.kg)) - 1 : 40;
    const maxKg = last10.length ? Math.max(...last10.map(w => w.kg)) + 1 : 80;
    const range = maxKg - minKg || 1;
    const pts = last10.map((w, i) => ({
      x: pad + (i / Math.max(last10.length - 1, 1)) * (chartW - pad * 2),
      y: pad + (1 - (w.kg - minKg) / range) * (chartH - pad * 2),
      kg: w.kg, date: w.date,
    }));
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const area = line + (pts.length ? ` L${pts[pts.length - 1].x},${chartH - pad} L${pts[0].x},${chartH - pad} Z` : "");

    return (
      <div style={{ padding: "0 18px 110px" }}>
        <div className="fIn" style={{ padding: "16px 0 12px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>⚖️ Theo dõi cân nặng</div>
          {latest && <div style={{ fontSize: 13, color: C.textSub }}>Gần nhất: {latest.kg}kg {diff !== null && <span style={{ color: parseFloat(diff) > 0 ? C.coral : C.mint }}>({parseFloat(diff) > 0 ? "+" : ""}{diff}kg)</span>}</div>}
        </div>

        {/* Chart */}
        {last10.length >= 2 && (
          <Card delay={80} style={{ padding: 12 }}>
            <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.pink} stopOpacity=".3" />
                  <stop offset="100%" stopColor={C.pink} stopOpacity=".02" />
                </linearGradient>
              </defs>
              {/* grid */}
              {[0, .25, .5, .75, 1].map(f => {
                const y = pad + f * (chartH - pad * 2);
                const v = (maxKg - f * range).toFixed(1);
                return <g key={f}><line x1={pad} y1={y} x2={chartW - pad} y2={y} stroke={C.border} strokeWidth="1" /><text x={pad - 6} y={y + 4} textAnchor="end" fill={C.textMuted} fontSize="9" fontFamily="monospace">{v}</text></g>;
              })}
              <path d={area} fill="url(#wg)" />
              <path d={line} fill="none" stroke={C.pink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={C.pink} stroke="#fff" strokeWidth="2" />)}
              {pts.map((p, i) => <text key={`t${i}`} x={p.x} y={chartH - pad + 16} textAnchor="middle" fill={C.textMuted} fontSize="8" fontFamily="monospace">{p.date.slice(5)}</text>)}
            </svg>
          </Card>
        )}

        {/* History */}
        <div style={{ marginTop: 14 }}>
          {[...sorted].reverse().map((w, i) => (
            <Card key={w.id} delay={i * 40} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, padding: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: C.pinkSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚖️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{w.kg}<span style={{ fontSize: 13, fontWeight: 500, color: C.textSub }}> kg</span></div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{new Date(w.date).toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "short" })}</div>
              </div>
              <div onClick={() => del(w.id)} style={{ color: C.textMuted, cursor: "pointer", fontSize: 13 }}>✕</div>
            </Card>
          ))}
        </div>

        {adding ? (
          <Card style={{ border: `2px solid ${C.pinkLight}`, marginTop: 10 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600 }}>Cân nặng (kg)</div>
                <Input type="number" step="0.1" value={nk} onChange={e => setNk(e.target.value)} placeholder="52.0" autoFocus onKeyDown={e => e.key === "Enter" && add()} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600 }}>Ngày</div>
                <input type="date" value={nd} onChange={e => setNd(e.target.value)} style={{ width: "100%", background: C.cardAlt, border: `2px solid ${C.border}`, borderRadius: 14, color: C.text, padding: "10px 12px", fontSize: 14, fontFamily: "'Quicksand',sans-serif" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="cute-btn" onClick={add} style={{ flex: 1, background: `linear-gradient(135deg, ${C.pink}, ${C.peach})`, color: "#fff", padding: "11px 0" }}>Lưu ⚖️</button>
              <button className="cute-btn" onClick={() => setAdding(false)} style={{ flex: 1, background: C.cardAlt, color: C.textSub, padding: "11px 0" }}>Huỷ</button>
            </div>
          </Card>
        ) : <div style={{ marginTop: 8 }}><AddRow label="Ghi nhận cân nặng" onClick={() => setAdding(true)} /></div>}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     🩸 PERIOD TRACKER
     ═══════════════════════════════════════════════════════════ */
  function periodInfo(p) {
    if (!p?.lastStart) return { label: "Chưa có", sub: "Nhập ngày bắt đầu", daysUntil: null, phase: "" };
    const ls = new Date(p.lastStart);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const daysSince = Math.floor((now - ls) / 86400000);
    const cycleDay = (daysSince % p.cycleLen) + 1;
    const daysUntil = p.cycleLen - (daysSince % p.cycleLen);
    const inPeriod = cycleDay <= p.periodLen;

    if (inPeriod) return { label: `Ngày ${cycleDay}`, sub: `Đang trong kỳ kinh`, daysUntil, phase: "period", cycleDay };
    if (daysUntil <= 5) return { label: `${daysUntil} ngày`, sub: "Sắp đến kỳ kinh", daysUntil, phase: "pre", cycleDay };
    // Ovulation ~day 14
    const ovDay = Math.round(p.cycleLen / 2) - 1;
    if (Math.abs(cycleDay - ovDay) <= 2) return { label: `Ngày ${cycleDay}`, sub: "Giai đoạn rụng trứng", daysUntil, phase: "ovulation", cycleDay };
    return { label: `${daysUntil} ngày`, sub: "Đến kỳ tiếp theo", daysUntil, phase: "normal", cycleDay };
  }

  const Period = () => {
    const p = data.period;
    const info = periodInfo(p);
    const [editing, setEditing] = useState(false);
    const [ls, setLs] = useState(p.lastStart || td);
    const [cl, setCl] = useState(p.cycleLen || 28);
    const [pl, setPl] = useState(p.periodLen || 5);
    const [logNote, setLogNote] = useState("");
    const [showLog, setShowLog] = useState(false);

    const save = () => { upd("period", prev => ({ ...prev, lastStart: ls, cycleLen: parseInt(cl) || 28, periodLen: parseInt(pl) || 5 })); setEditing(false); };
    const logDay = (mood) => { upd("period", prev => ({ ...prev, logs: { ...prev.logs, [td]: { mood, note: logNote } } })); setLogNote(""); setShowLog(false); };

    const phaseColors = { period: C.coral, pre: C.peach, ovulation: C.lav, normal: C.mint };
    const phaseEmoji = { period: "🩸", pre: "⚡", ovulation: "🌸", normal: "💚" };
    const phaseC = phaseColors[info.phase] || C.pink;

    // Generate mini calendar (current month)
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calDays = [];
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) calDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calDays.push(i);

    const getDayPhase = (dayNum) => {
      if (!p.lastStart) return null;
      const ls2 = new Date(p.lastStart);
      const check = new Date(year, month, dayNum);
      check.setHours(0, 0, 0, 0);
      const diff = Math.floor((check - ls2) / 86400000);
      if (diff < 0) return null;
      const cd = (diff % p.cycleLen) + 1;
      if (cd <= p.periodLen) return "period";
      const ovD = Math.round(p.cycleLen / 2) - 1;
      if (Math.abs(cd - ovD) <= 1) return "ovulation";
      if (cd > p.cycleLen - 3) return "pre";
      return null;
    };

    const todayLog = p.logs?.[td];
    const moodEmojis = [{ e: "😊", l: "Vui" }, { e: "😐", l: "Bình thường" }, { e: "😢", l: "Buồn" }, { e: "😤", l: "Khó chịu" }, { e: "🥱", l: "Mệt" }, { e: "🤢", l: "Khó ở" }];

    return (
      <div style={{ padding: "0 18px 110px" }}>
        <div className="fIn" style={{ padding: "16px 0 12px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>🩸 Theo dõi kinh nguyệt</div>
        </div>

        {/* Main status */}
        <Card delay={60} style={{ textAlign: "center", background: `linear-gradient(135deg, ${phaseC}15, ${phaseC}08)`, border: `2px solid ${phaseC}30` }}>
          <div style={{ fontSize: 48, marginBottom: 4, animation: "float 3s ease infinite" }}>{phaseEmoji[info.phase] || "🌸"}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: phaseC }}>{info.label}</div>
          <div style={{ fontSize: 14, color: C.textSub, fontWeight: 600, marginTop: 4 }}>{info.sub}</div>
          {info.cycleDay && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>Ngày {info.cycleDay} của chu kỳ · Chu kỳ {p.cycleLen} ngày</div>}
        </Card>

        {/* Legend */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", margin: "14px 0 6px", flexWrap: "wrap" }}>
          {[{ c: C.coral, l: "Kinh nguyệt" }, { c: C.lav, l: "Rụng trứng" }, { c: C.peach, l: "Sắp đến kỳ" }].map(x => (
            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textSub, fontWeight: 600 }}>
              <div style={{ width: 10, height: 10, borderRadius: 4, background: x.c }} /> {x.l}
            </div>
          ))}
        </div>

        {/* Mini Calendar */}
        <Card delay={120} style={{ padding: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, textAlign: "center", marginBottom: 10 }}>
            Tháng {month + 1}/{year}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, textAlign: "center" }}>
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => <div key={d} style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, padding: 4 }}>{d}</div>)}
            {calDays.map((d, i) => {
              if (!d) return <div key={`e${i}`} />;
              const phase = getDayPhase(d);
              const isToday = d === now.getDate();
              const hasLog = p.logs?.[`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`];
              return (
                <div key={i} style={{
                  width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: isToday ? 800 : 500, margin: "0 auto",
                  background: phase === "period" ? `${C.coral}25` : phase === "ovulation" ? `${C.lav}25` : phase === "pre" ? `${C.peach}20` : "transparent",
                  color: isToday ? C.pink : C.text,
                  border: isToday ? `2.5px solid ${C.pink}` : "2.5px solid transparent",
                  position: "relative",
                }}>
                  {d}
                  {hasLog && <div style={{ position: "absolute", bottom: 2, width: 4, height: 4, borderRadius: "50%", background: C.pink }} />}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Log mood */}
        {!showLog ? (
          <Card delay={160} style={{ marginTop: 12, textAlign: "center", cursor: "pointer" }} onClick={() => setShowLog(true)}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
              {todayLog ? `Hôm nay: ${todayLog.mood} ${todayLog.note ? "· " + todayLog.note : ""}` : "📋 Ghi nhận tâm trạng hôm nay"}
            </div>
          </Card>
        ) : (
          <Card delay={0} style={{ marginTop: 12, border: `2px solid ${C.pinkLight}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.pink, marginBottom: 10 }}>Tâm trạng hôm nay</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {moodEmojis.map(m => (
                <button key={m.e} className="cute-btn" onClick={() => logDay(m.e)} style={{ padding: "8px 14px", background: C.cardAlt, border: `2px solid ${C.border}`, borderRadius: 12, fontSize: 13, color: C.text, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 18 }}>{m.e}</span> {m.l}
                </button>
              ))}
            </div>
            <Input value={logNote} onChange={e => setLogNote(e.target.value)} placeholder="Ghi chú thêm (tuỳ chọn)..." style={{ marginBottom: 10 }} />
            <button className="cute-btn" onClick={() => setShowLog(false)} style={{ width: "100%", background: C.cardAlt, color: C.textSub, padding: "10px 0" }}>Đóng</button>
          </Card>
        )}

        {/* Settings */}
        {!editing ? (
          <Card delay={200} style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>⚙️ Cài đặt chu kỳ</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Chu kỳ {p.cycleLen} ngày · Kỳ kinh {p.periodLen} ngày</div>
              </div>
              <button className="cute-btn" onClick={() => setEditing(true)} style={{ padding: "7px 16px", background: C.pinkSoft, color: C.pink, border: `1.5px solid ${C.pinkLight}`, borderRadius: 10, fontSize: 13 }}>Sửa</button>
            </div>
          </Card>
        ) : (
          <Card style={{ marginTop: 12, border: `2px solid ${C.pinkLight}` }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600 }}>Ngày bắt đầu kỳ gần nhất</div>
            <input type="date" value={ls} onChange={e => setLs(e.target.value)} style={{ width: "100%", background: C.cardAlt, border: `2px solid ${C.border}`, borderRadius: 14, color: C.text, padding: "10px 12px", fontSize: 14, fontFamily: "'Quicksand',sans-serif", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600 }}>Độ dài chu kỳ</div>
                <Input type="number" value={cl} onChange={e => setCl(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 600 }}>Ngày kinh nguyệt</div>
                <Input type="number" value={pl} onChange={e => setPl(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="cute-btn" onClick={save} style={{ flex: 1, background: `linear-gradient(135deg, ${C.pink}, ${C.peach})`, color: "#fff", padding: "11px 0" }}>Lưu 🩸</button>
              <button className="cute-btn" onClick={() => setEditing(false)} style={{ flex: 1, background: C.cardAlt, color: C.textSub, padding: "11px 0" }}>Huỷ</button>
            </div>
          </Card>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     🧭 NAVIGATION & LAYOUT
     ═══════════════════════════════════════════════════════════ */
  const tabs = [
    { key: "home", label: "Trang chủ", emoji: "🏠" },
    { key: "habit", label: "Thói quen", emoji: "🌸" },
    { key: "todo", label: "Việc làm", emoji: "📝" },
    { key: "schedule", label: "Lịch", emoji: "📅" },
    { key: "more", label: "Thêm", emoji: "✨" },
  ];

  const [showMore, setShowMore] = useState(false);
  const moreTabs = [
    { key: "reminder", label: "Nhắc nhở", emoji: "🔔" },
    { key: "quotes", label: "Quotes", emoji: "💬" },
    { key: "weight", label: "Cân nặng", emoji: "⚖️" },
    { key: "period", label: "Kinh nguyệt", emoji: "🩸" },
  ];

  const handleTab = (key) => {
    if (key === "more") { setShowMore(!showMore); return; }
    setTab(key); setShowMore(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.bg, fontFamily: "'Quicksand', 'Segoe UI', sans-serif", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.pink, textTransform: "uppercase", letterSpacing: 2 }}>🌸 Cute Planner</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>
          {new Date().toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: 0 }}>
        {tab === "home" && <Home />}
        {tab === "habit" && <Habits />}
        {tab === "todo" && <Todos />}
        {tab === "schedule" && <Schedule />}
        {tab === "reminder" && <Reminders />}
        {tab === "quotes" && <Quotes />}
        {tab === "weight" && <Weight />}
        {tab === "period" && <Period />}
      </div>

      {/* More menu overlay */}
      {showMore && (
        <div onClick={() => setShowMore(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.15)", zIndex: 90 }}>
          <div onClick={e => e.stopPropagation()} className="pop" style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 40px)", maxWidth: 440, background: C.card, borderRadius: 24, padding: 16, boxShadow: "0 -8px 40px rgba(0,0,0,.12)", zIndex: 91 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {moreTabs.map(t => (
                <button key={t.key} className="cute-btn wig" onClick={() => handleTab(t.key)} style={{
                  padding: "16px 12px", background: tab === t.key ? C.pinkSoft : C.cardAlt, border: tab === t.key ? `2px solid ${C.pinkLight}` : `2px solid ${C.borderLight}`,
                  borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: tab === t.key ? C.pink : C.text,
                }}>
                  <span style={{ fontSize: 26 }}>{t.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480,
        background: "rgba(255,248,240,.94)", backdropFilter: "blur(20px)", borderTop: `1.5px solid ${C.border}`,
        display: "flex", justifyContent: "space-around", padding: "6px 0 max(env(safe-area-inset-bottom), 10px)", zIndex: 100,
      }}>
        {tabs.map(t => {
          const active = t.key === "more" ? showMore : tab === t.key;
          return (
            <button key={t.key} onClick={() => handleTab(t.key)} style={{
              background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 2, padding: "4px 14px", color: active ? C.pink : C.textMuted, transition: "all .2s",
            }}>
              <span style={{ fontSize: 22, transform: active ? "scale(1.15)" : "scale(1)", transition: "transform .2s" }}>{t.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 700 }}>{t.label}</span>
              {active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.pink }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
