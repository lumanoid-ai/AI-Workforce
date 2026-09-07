import React, { useState, useRef, useEffect, useCallback, useReducer } from "react";

/* ============================================================
   1. TOKENS
   ============================================================ */
const T = {
  floor: "#0A0E14",
  panel: "#121822",
  raised: "#1B2430",
  line: "#232E3D",
  lineSoft: "rgba(255,255,255,0.13)",
  text: "#E6EAF0",
  text2: "#8A96A8",
  text3: "#5D6B7D",
  text4: "#3A4453",
  paper: "#F7F5F0",
  paperInk: "#2C2C2A",
  paperRule: "#DAD7CF",
  silver: "#C8D2E0",
};

const PEOPLE = [
  { key: "manager",   default: "Syed Mahmood Ejaz", hex: "#8B5CF6", tint: "#C4B5FD", rgb: "139,92,246" },
  { key: "hr",        default: "Muhammad Ghous",    hex: "#10B981", tint: "#6EE7B7", rgb: "16,185,129" },
  { key: "data",      default: "Muhammad Areeb",    hex: "#3B82F6", tint: "#93C5FD", rgb: "59,130,246" },
  { key: "research",  default: "Musab Iqbal",       hex: "#D4537E", tint: "#F0A0BC", rgb: "212,83,126" },
  { key: "scheduler", default: "Musab",             hex: "#F59E0B", tint: "#FCD34D", rgb: "245,158,11" },
];
const byKey = Object.fromEntries(PEOPLE.map((p) => [p.key, p]));
const DEFAULT_NAMES = Object.fromEntries(PEOPLE.map((p) => [p.key, p.default]));
const blankStatus = () => Object.fromEntries(PEOPLE.map((p) => [p.key, "off"]));
const firstName = (n) => (n || "").trim().split(/\s+/)[0] || n;

/* ============================================================
   2. LANGUAGE
   ============================================================ */
const I18N = {
  en: {
    ui: {
      team: "Your team", feed: "What's happening", finished: "Finished work",
      placeholder: "What do you need help with?", send: "Ask the team",
      hint: "Describe what you need. The team decides who does what.",
      close: "Close", emptyFeed: "Nothing yet.", emptyShelf: "Finished documents appear here.",
      again: "Start over", example: "Try an example",
      setupTitle: "Name your team", setupHint: "Give each person a name. You can change these later.",
      start: "Take me in", rename: "Rename", skip: "Click anywhere to skip",
      teamName: "Team name", teamHint: "Optional — leave it blank if you like",
      newTeam: "New team", save: "Save changes", waiting: "Waiting to start",
      atWork: "at work", handedTo: "handing over to", nothingYet: "No one is working yet",
      docsBy: "Documents from", noDocs: "Nothing finished yet",
      download: "Download", dlPdf: "PDF", dlText: "Text", dlMd: "Markdown",
      dlAll: "Download all", request: "Request", preparedBy: "Prepared by",
      calendar: "Google Calendar", calEmail: "Your Google email",
      calConnect: "Connect calendar", calConnected: "Calendar connected",
      calChecking: "Checking", calWaiting: "Finish sign-in in the new tab",
      calFail: "Could not reach the calendar service. Check the server is running.",
      calHint: "Lets the scheduler put interviews straight into a real calendar.",
      connLive: "Backend connected", connDown: "Backend offline",
      sendFail: "Could not reach the backend. Check the server is running on port 8000.",
      finalDoc: "Final answer", noPreview: "This document has no text preview.",
      history: "Earlier questions", viewingOld: "Viewing an earlier answer",
      backToLatest: "Back to the latest", askedNothing: "No question yet",
    },
    status: { off: "available", on: "working", done: "finished" },
    roles: {
      manager: "runs the team (Manager)", hr: "hiring and people (HR)",
      data: "numbers (Data Analyst)", research: "looks things up (Research)",
      scheduler: "calendars and scheduling (Scheduler)",
    },
    example: "I need to hire two salespeople in Karachi",
    script: {
      s1: "{manager} is working out who to bring in",
      s2: "{manager} asked {hr} to write the job roles",
      s3: "{hr} is drafting the roles",
      s4: "{hr} finished the job descriptions",
      s5: "{hr} passed them to {data}",
      s6: "{data} is opening the salary data",
      s7: "{data} is comparing pay across Karachi",
      s8: "{data} finished the pay comparison",
      s9: "{data} passed the numbers to {research}",
      s10: "{research} is searching for places to post",
      s11: "{research} finished a list of hiring sites",
      s12: "{research} handed the shortlist to {scheduler}",
      s13: "{scheduler} is checking your calendar",
      s14: "{scheduler} set up the interview times",
      s15: "{scheduler} sent everything back to {manager}",
      s16: "{manager} is putting it all together",
      s17: "{manager} finished your hiring plan",
      s18: "The team is done",
    },
    docs: {
      d1: { title: "Job descriptions", body: ["Sales Executive — 2 roles, Karachi.", "Reports to the founder.", "Base pay plus commission."] },
      d2: { title: "Pay comparison", body: ["Market range for this role in Karachi.", "Your budget sits mid-range.", "Commission is usually 10–15%."] },
      d3: { title: "Where to post", body: ["Four hiring sites with active listings.", "Two of them are free to post on."] },
      d5: { title: "Interview times", body: ["Three slots next week, all mornings.", "Both candidates confirmed by email.", "Added to your calendar."] },
      d4: { title: "Your hiring plan", body: ["Two sales roles, written and ready to post.", "Pay range checked against the local market.", "Four places to advertise, two of them free.", "Interviews booked for next week."] },
    },
  },
  ur: {
    ui: {
      team: "Aap ki team", feed: "Kya ho raha hai", finished: "Mukammal kaam",
      placeholder: "Aap ko kis cheez mein madad chahiye?", send: "Team se poochein",
      hint: "Bataiye aap ko kya chahiye. Team khud tay kar legi kaun kya karega.",
      close: "Band karein", emptyFeed: "Abhi kuch nahi.", emptyShelf: "Mukammal documents yahan aayenge.",
      again: "Dobara shuru karein", example: "Misaal dekhein",
      setupTitle: "Apni team ke naam rakhein", setupHint: "Har shakhs ko naam dein. Baad mein tabdeel kar sakte hain.",
      start: "Chaliye shuru karein", rename: "Naam badlein", skip: "Skip karne ke liye kahin bhi click karein",
      teamName: "Team ka naam", teamHint: "Ikhtiyari — chahein to khali chhor dein",
      newTeam: "Nai team", save: "Tabdeeli mehfooz karein", waiting: "Shuru hone ka intezar",
      atWork: "kaam par", handedTo: "de rahe hain", nothingYet: "Abhi koi kaam nahi kar raha",
      docsBy: "In ke documents:", noDocs: "Abhi kuch mukammal nahi",
      download: "Download karein", dlPdf: "PDF", dlText: "Text", dlMd: "Markdown",
      dlAll: "Sab download karein", request: "Darkhwast", preparedBy: "Tayyar karda",
      calendar: "Google Calendar", calEmail: "Aap ka Google email",
      calConnect: "Calendar joRein", calConnected: "Calendar juR gaya",
      calChecking: "Dekh rahe hain", calWaiting: "Naye tab mein sign-in mukammal karein",
      calFail: "Calendar service tak nahi pohanch sake. Server chal raha hai ya nahi dekhein.",
      calHint: "Is se scheduler interviews seedha asli calendar mein daal sakta hai.",
      connLive: "Backend juRa hua", connDown: "Backend band hai",
      sendFail: "Backend tak nahi pohanch sake. Server port 8000 par chal raha hai ya nahi dekhein.",
      finalDoc: "Aakhri jawab", noPreview: "Is document ka text preview mojood nahi.",
      history: "Pichle sawalat", viewingOld: "Pichla jawab dekh rahe hain",
      backToLatest: "Naye par wapas", askedNothing: "Abhi koi sawal nahi",
    },
    status: { off: "farigh", on: "kaam kar rahe hain", done: "mukammal" },
    roles: {
      manager: "team chalate hain (Manager)", hr: "hiring aur log (HR)",
      data: "numbers (Data Analyst)", research: "maloomat dhoondte hain (Research)",
      scheduler: "calendar aur scheduling (Scheduler)",
    },
    example: "Mujhe Karachi mein do salespeople hire karne hain",
    script: {
      s1: "{manager} soch rahe hain ke kis ko bulana hai",
      s2: "{manager} ne {hr} se job roles likhne ko kaha",
      s3: "{hr} roles likh rahe hain",
      s4: "{hr} ne job descriptions mukammal kar li",
      s5: "{hr} ne wo {data} ko de diye",
      s6: "{data} salary ka data khol rahe hain",
      s7: "{data} Karachi mein tankhwah compare kar rahe hain",
      s8: "{data} ne tankhwah ka moazna mukammal kar liya",
      s9: "{data} ne numbers {research} ko bhej diye",
      s10: "{research} job posting ki jagahein dhoond rahe hain",
      s11: "{research} ne hiring sites ki list bana li",
      s12: "{research} ne list {scheduler} ko de di",
      s13: "{scheduler} aap ka calendar dekh rahe hain",
      s14: "{scheduler} ne interview ke waqt tay kar diye",
      s15: "{scheduler} ne sab kuch {manager} ko wapas bhej diya",
      s16: "{manager} sab kuch jama kar rahe hain",
      s17: "{manager} ne aap ka hiring plan mukammal kar liya",
      s18: "Team ka kaam mukammal",
    },
    docs: {
      d1: { title: "Job descriptions", body: ["Sales Executive — 2 roles, Karachi.", "Founder ko report karenge.", "Base pay aur commission."] },
      d2: { title: "Tankhwah ka moazna", body: ["Karachi mein is role ki market range.", "Aap ka budget darmiyane mein hai.", "Commission aam tor par 10–15%."] },
      d3: { title: "Kahan post karein", body: ["Chaar hiring sites jahan listings chal rahi hain.", "Do par posting muft hai."] },
      d5: { title: "Interview ke auqat", body: ["Agle hafte teen slots, subah ke waqt.", "Dono candidates ne email par confirm kiya.", "Aap ke calendar mein shamil kar diya."] },
      d4: { title: "Aap ka hiring plan", body: ["Do sales roles, likhe hue aur post karne ke liye tayyar.", "Tankhwah local market se check ki gayi.", "Chaar jagahein, do muft.", "Interviews agle hafte ke liye tay."] },
    },
  },
  zh: {
    ui: {
      team: "你的团队", feed: "正在发生什么", finished: "已完成的工作",
      placeholder: "你需要什么帮助？", send: "交给团队",
      hint: "描述你的需求，团队会自行分工。",
      close: "关闭", emptyFeed: "暂无动态。", emptyShelf: "完成的文件会出现在这里。",
      again: "重新开始", example: "试试示例",
      setupTitle: "为你的团队命名", setupHint: "给每位成员起个名字，之后可以修改。",
      start: "进入", rename: "重新命名", skip: "点击任意位置跳过",
      teamName: "团队名称", teamHint: "可选 — 也可以留空",
      newTeam: "新建团队", save: "保存修改", waiting: "等待开始",
      atWork: "工作中", handedTo: "正在交给", nothingYet: "目前无人工作",
      docsBy: "来自", noDocs: "尚未完成任何内容",
      download: "下载", dlPdf: "PDF", dlText: "文本", dlMd: "Markdown",
      dlAll: "全部下载", request: "请求", preparedBy: "制作者",
      calendar: "Google 日历", calEmail: "你的 Google 邮箱",
      calConnect: "连接日历", calConnected: "日历已连接",
      calChecking: "检查中", calWaiting: "请在新标签页完成登录",
      calFail: "无法连接日历服务，请确认服务器正在运行。",
      calHint: "连接后，日程助理可以把面试直接写入真实日历。",
      connLive: "后端已连接", connDown: "后端未连接",
      sendFail: "无法连接后端，请确认服务器正在 8000 端口运行。",
      finalDoc: "最终答复", noPreview: "此文件暂无文本预览。",
      history: "以往的提问", viewingOld: "正在查看以往的答复",
      backToLatest: "返回最新", askedNothing: "尚无提问",
    },
    status: { off: "空闲", on: "进行中", done: "已完成" },
    roles: {
      manager: "带领团队（经理）", hr: "招聘与人事（HR）",
      data: "数据（数据分析师）", research: "查找资料（研究员）",
      scheduler: "日程安排（日程助理）",
    },
    example: "我需要在卡拉奇招聘两名销售人员",
    script: {
      s1: "{manager} 正在决定需要谁来处理",
      s2: "{manager} 请 {hr} 写职位描述",
      s3: "{hr} 正在起草职位",
      s4: "{hr} 完成了职位描述",
      s5: "{hr} 把它交给了 {data}",
      s6: "{data} 正在打开薪资数据",
      s7: "{data} 正在比较卡拉奇的薪资",
      s8: "{data} 完成了薪资对比",
      s9: "{data} 把数据交给了 {research}",
      s10: "{research} 正在寻找发布招聘的渠道",
      s11: "{research} 整理好了招聘网站清单",
      s12: "{research} 把清单交给了 {scheduler}",
      s13: "{scheduler} 正在查看你的日程",
      s14: "{scheduler} 安排好了面试时间",
      s15: "{scheduler} 把所有内容交回给 {manager}",
      s16: "{manager} 正在整合所有内容",
      s17: "{manager} 完成了你的招聘计划",
      s18: "团队已完成",
    },
    docs: {
      d1: { title: "职位描述", body: ["销售专员 — 2 个职位，卡拉奇。", "直接向创始人汇报。", "底薪加提成。"] },
      d2: { title: "薪资对比", body: ["卡拉奇该职位的市场区间。", "你的预算处于中位。", "提成通常为 10–15%。"] },
      d3: { title: "发布渠道", body: ["四个正在活跃的招聘网站。", "其中两个可免费发布。"] },
      d5: { title: "面试时间", body: ["下周三个时段，均在上午。", "两位候选人已通过邮件确认。", "已加入你的日程。"] },
      d4: { title: "你的招聘计划", body: ["两个销售职位，已写好可直接发布。", "薪资已对照本地市场核对。", "四个发布渠道，两个免费。", "面试已安排在下周。"] },
    },
  },
};

const fill = (s, names) =>
  typeof s === "string" ? s.replace(/\{(\w+)\}/g, (m, k) => names[k] || m) : s;

/* ============================================================
   3. EVENT SOURCE
   Mock: one independent source per team, so teams run in parallel.
   Live: one SSE connection, events routed by ev.workspace_id.
   ============================================================ */
const USE_MOCK = false;
const API_BASE = "http://localhost:8000";
const ADMIN_KEY = "change-me-admin-key";   // must match ADMIN_API_KEY in the backend .env

const SCRIPT = [
  { id: "s1",  at: 400,   agent: "manager",   type: "thinking" },
  { id: "s2",  at: 1900,  agent: "manager",   type: "handoff",  payload: { from: "manager", to: "hr" } },
  { id: "s3",  at: 3100,  agent: "hr",        type: "thinking" },
  { id: "s4",  at: 5400,  agent: "hr",        type: "artifact", payload: { doc: "d1" } },
  { id: "s5",  at: 6600,  agent: "hr",        type: "handoff",  payload: { from: "hr", to: "data" } },
  { id: "s6",  at: 7800,  agent: "data",      type: "thinking" },
  { id: "s7",  at: 9800,  agent: "data",      type: "tool_call" },
  { id: "s8",  at: 11400, agent: "data",      type: "artifact", payload: { doc: "d2" } },
  { id: "s9",  at: 12600, agent: "data",      type: "handoff",  payload: { from: "data", to: "research" } },
  { id: "s10", at: 13800, agent: "research",  type: "thinking" },
  { id: "s11", at: 16000, agent: "research",  type: "artifact", payload: { doc: "d3" } },
  { id: "s12", at: 17200, agent: "research",  type: "handoff",  payload: { from: "research", to: "scheduler" } },
  { id: "s13", at: 18400, agent: "scheduler", type: "thinking" },
  { id: "s14", at: 20600, agent: "scheduler", type: "artifact", payload: { doc: "d5" } },
  { id: "s15", at: 21800, agent: "scheduler", type: "handoff",  payload: { from: "scheduler", to: "manager" } },
  { id: "s16", at: 23000, agent: "manager",   type: "thinking" },
  { id: "s17", at: 25200, agent: "manager",   type: "artifact", payload: { doc: "d4", final: true } },
  { id: "s18", at: 26000, agent: "manager",   type: "done" },
];

function makeMockSource(workspaceId) {
  let handler = () => {};
  let timers = [];
  return {
    subscribe(fn) { handler = fn; return () => { handler = () => {}; }; },
    sendTask({ language }) {
      timers.forEach(clearTimeout);
      // small random drift so two teams running at once don't march in lockstep
      const drift = 0.85 + Math.random() * 0.4;
      timers = SCRIPT.map((s) =>
        setTimeout(() => handler({
          workspace_id: workspaceId, agent: s.agent, type: s.type,
          message: I18N[language].script[s.id], payload: s.payload || {},
        }), Math.round(s.at * drift))
      );
      return Promise.resolve({ task_id: "mock-" + Date.now() });
    },
    stop() { timers.forEach(clearTimeout); timers = []; },
  };
}

/* backend role names -> our internal keys */
const AGENT_MAP = {
  manager: "manager", hr: "hr", data: "data",
  research: "research", calendar: "scheduler", scheduler: "scheduler",
};

/* backend writes role words into its messages; swap them for the
   placeholders fill() understands, so custom names show in the feed */
const ROLE_WORDS = {
  Manager: "{manager}", HR: "{hr}", Data: "{data}",
  Research: "{research}", Calendar: "{scheduler}",
};

/* the backend logs raw tool signatures; say what they mean instead */
const TOOL_WORDS = {
  web_search: "searching the web",
  create_jd: "writing the job description",
  score_candidates: "scoring the candidates",
  parse_resume: "reading the resumes",
  screening_questions: "preparing screening questions",
  book_interview: "booking the interview",
  send_email: "sending an email",
  hiring_metrics: "pulling the hiring numbers",
  run_sql: "querying the dataset",
  list_events: "checking the calendar",
  free_busy: "checking who's free",
  delegate: "handing work to a specialist",
};

function normalize(ev) {
  const agent = AGENT_MAP[(ev.agent || "").toLowerCase()] || "manager";
  const p = ev.payload || {};
  let payload = p, type = ev.type;

  if (type === "handoff") {
    payload = { from: agent, to: AGENT_MAP[(p.to || "").toLowerCase()] || "hr" };
  }
  if (type === "artifact") {
    payload = { title: ev.message || "Document", body: [], id: p.id };
  }
  /* only run_task's "done" ends a run; base_agent sends "agent_done" */
  if (type === "agent_done" || (type === "done" && agent !== "manager")) {
    type = "tool_call";
  }

  /* only rewrite role words in the backend's own status lines — never in
     answer text or document titles, where "Data Analyst" is real content */
  
  let message = ev.message || "";
  if (ev.type !== "done" && ev.type !== "agent_done" && ev.type !== "artifact") {
    for (const [word, token] of Object.entries(ROLE_WORDS)) {
      message = message.replace(new RegExp(`\\b${word}\\b`, "g"), token);
    }
  }

  if (ev.type === "tool_call") {
    const tool = (p.tool || String(ev.message || "").split("(")[0] || "").trim();
    message = TOOL_WORDS[tool] || (tool ? tool.replace(/_/g, " ") : message);
  }

  return { ...ev, agent, type, payload, message };
}

/* one shared live connection; every event must carry workspace_id */
function makeLiveHub() {
  let es = null;
  const listeners = new Set();
  const statusListeners = new Set();
  const setStatus = (s) => statusListeners.forEach((f) => f(s));

  return {
    onStatus(fn) { statusListeners.add(fn); return () => statusListeners.delete(fn); },
    subscribe(fn) {
      listeners.add(fn);
      if (!es) {
        es = new EventSource(`${API_BASE}/api/events/stream`);
        es.onopen = () => setStatus("live");
        es.onerror = () => setStatus("down");
        es.onmessage = (e) => {
          try { const ev = normalize(JSON.parse(e.data)); listeners.forEach((l) => l(ev)); } catch (err) {}
        };
      }
   
      return () => listeners.delete(fn);
    },
    async sendTask({ instruction, workspace_id, language, names, team_name }) {
      const r = await fetch(`${API_BASE}/api/agent/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, workspace_id, language, names, team_name }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    },
    stop() {},
  };
}

/* ============================================================
   4. LOGO
   ============================================================ */
const NODES = [
  { x: 6.8,  y: 6.8,  k: "hr" },
  { x: 25.2, y: 6.8,  k: "data" },
  { x: 25.2, y: 25.2, k: "research" },
  { x: 6.8,  y: 25.2, k: "scheduler" },
];

function Mark({ size = 30, animated = false, live = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: "none" }}>
      <circle cx="16" cy="16" r="13" fill="none" stroke={T.silver} strokeWidth="0.75" opacity="0.3"
              className={animated ? "aw-mk-ring" : ""} />
      {NODES.map((n, i) => (
        <line key={"l" + i} x1="16" y1="16" x2={n.x} y2={n.y}
              stroke={byKey[n.k].hex} strokeWidth="0.7" opacity={animated ? 0 : 0.4}
              className={animated ? "aw-mk-link" : ""}
              style={animated ? { animationDelay: `${1.35 + i * 0.22}s` } : undefined} />
      ))}
      {NODES.map((n, i) => (
        <circle key={"n" + i} cx={n.x} cy={n.y} r="2.4" fill={byKey[n.k].hex}
                className={animated ? "aw-mk-node" : ""}
                style={animated ? { animationDelay: `${1.42 + i * 0.24}s` } : undefined} />
      ))}
      <circle cx="16" cy="16" r="3.4" fill={byKey.manager.hex}
              className={[animated ? "aw-mk-node" : "", live ? "aw-mk-live" : ""].join(" ")}
              style={animated ? { animationDelay: "0.95s" } : undefined} />
    </svg>
  );
}

/* ============================================================
   5. STYLES
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap');

.aw { font-family:'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
      background:${T.floor}; color:${T.text};
      min-height:100vh; min-height:100dvh; height:100%;
      display:flex; flex-direction:column; padding:16px;
      position:relative; overflow:hidden; box-sizing:border-box; }
.aw *, .aw *::before, .aw *::after { box-sizing:border-box; }
.aw *:focus-visible { outline:2px solid ${T.silver}; outline-offset:2px; border-radius:4px; }

.aw-bg { position:absolute; inset:0; pointer-events:none; transition:opacity .9s ease; }
.aw-bg.quiet { opacity:.3; }
.aw-ln { position:absolute; top:-30%; left:0; width:1px; height:160%;
         background:${T.silver}; opacity:.16; animation: awSweep 10s linear infinite; }
@keyframes awSweep {
  from { transform: translateX(-200px) rotate(24deg); }
  to   { transform: translateX(125vw)  rotate(24deg); }
}

.aw-glow { position:fixed; top:0; left:0; width:280px; height:280px; border-radius:50%;
           pointer-events:none; z-index:60; mix-blend-mode:screen; will-change:transform;
           background:radial-gradient(circle closest-side,
             rgba(255,255,255,.11), rgba(255,255,255,.045) 42%, rgba(255,255,255,0) 72%); }
.aw-glow::after { content:''; position:absolute; top:50%; left:50%; width:14px; height:14px;
                  margin:-7px 0 0 -7px; border-radius:50%; background:rgba(255,255,255,.20); }
@media (hover:none), (pointer:coarse) { .aw-glow { display:none; } }

/* ---------- intro (unchanged) ---------- */
.aw-splash { position:relative; flex:1 1 auto; display:flex; flex-direction:column;
             align-items:center; justify-content:center; gap:22px; cursor:pointer;
             padding:0 18px; text-align:center;
             animation: awSplashOut .6s ease 6.2s both; }
@keyframes awSplashOut { to { opacity:0; transform:scale(1.04); } }
.aw-marklg svg { width:clamp(58px,17vw,96px); height:auto; }
.aw-mk-ring { stroke-dasharray:82; stroke-dashoffset:82;
              animation: awDraw 1.8s cubic-bezier(.22,1,.36,1) .3s forwards; }
@keyframes awDraw { to { stroke-dashoffset:0 } }
.aw-mk-node { opacity:0; transform-box:fill-box; transform-origin:center;
              animation: awPop .5s cubic-bezier(.34,1.4,.64,1) forwards; }
@keyframes awPop { from{opacity:0; transform:scale(.2)} to{opacity:1; transform:scale(1)} }
.aw-mk-link { animation: awLink .5s ease forwards; }
@keyframes awLink { to { opacity:.4 } }
.aw-mk-live { animation: awLamp 2.4s ease-in-out infinite; }
.aw-word { position:relative; overflow:hidden; padding:2px 6px; opacity:0;
           animation: awUp 1s cubic-bezier(.22,1,.36,1) 2.4s forwards; }
.aw-word h1 { margin:0; font-size:clamp(28px,8vw,58px); font-weight:600;
              letter-spacing:-0.025em; line-height:1.05; white-space:nowrap; }
.aw-sweep { position:absolute; inset:0; transform:translateX(-130%);
            background:linear-gradient(105deg, transparent 40%, rgba(255,255,255,.55) 50%, transparent 60%);
            animation: awSweepX 1.2s ease 3.7s 1 both; }
@keyframes awSweepX { to { transform:translateX(130%) } }
.aw-tag { font-size:13px; color:${T.text3}; max-width:34ch; line-height:1.5;
          opacity:0; animation: awUp .8s ease 4.4s forwards; }
.aw-skip { position:absolute; bottom:8px; font-size:11.5px; color:${T.text4};
           opacity:0; animation: awFadeIn .7s ease 5.1s forwards; }
@keyframes awFadeIn { to { opacity:1 } }
@keyframes awUp { from{opacity:0; transform:translateY(12px)} to{opacity:1; transform:none} }

/* ---------- shell ---------- */
.aw-head { position:relative; display:flex; align-items:center; gap:12px;
           padding:2px 6px 12px; flex-wrap:wrap; }
.aw-head b { font-size:14px; font-weight:600; letter-spacing:-0.01em; color:${T.text2}; }
.aw-conn { display:flex; align-items:center; gap:6px; font-size:11.5px; color:${T.text4}; }
.aw-tabs { display:flex; align-items:center; gap:6px; margin-left:auto; flex-wrap:wrap; }
.aw-tab { display:flex; align-items:center; gap:7px; font:inherit; font-size:12.5px;
          color:${T.text3}; background:${T.panel}; border:0.5px solid ${T.line};
          border-radius:9px; padding:7px 12px; cursor:pointer; max-width:190px;
          transition:color .3s ease, border-color .3s ease, background .3s ease; }
.aw-tab:hover { color:${T.text2}; }
.aw-tab.on { color:${T.text}; border-color:rgba(139,92,246,.6); background:rgba(139,92,246,.12); }
.aw-tab span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.aw-tab i { width:6px; height:6px; border-radius:50%; flex:none; background:${T.text4}; }
.aw-tab i.live { background:#8B5CF6; animation: awLamp 1.8s ease-in-out infinite; }
.aw-tab i.done { background:#10B981; }
.aw-new { font:inherit; font-size:12.5px; color:${T.text3}; background:none;
          border:0.5px dashed ${T.line}; border-radius:9px; padding:7px 12px; cursor:pointer;
          transition:color .3s ease, border-color .3s ease; }
.aw-new:hover { color:${T.text2}; border-color:#3A4453; }

.aw-grid { position:relative; display:grid; gap:14px; width:100%; max-width:1680px;
           margin:0 auto; flex:1 1 auto; min-height:0; grid-template-columns:1fr; }
@media (min-width:960px) { .aw-grid { grid-template-columns:210px minmax(0,1fr) 250px; } }
.aw-col { background:${T.panel}; border:0.5px solid ${T.line}; border-radius:14px;
          padding:16px; display:flex; flex-direction:column; min-height:0;
          transition: border-color 1.1s ease, background-color 1.1s ease; }
.lit .aw-col { border-color:rgba(200,210,224,.26); background:#141B26; }
@media (max-width:959px) {
  .aw-main { order:1 } .aw-feed { order:2 } .aw-team { order:3 }
  .aw-grid { flex:0 0 auto }
  .aw { overflow:auto }
}
.aw-label { font-size:12px; color:${T.text3}; margin-bottom:12px; }

/* ---------- calendar block ---------- */
.aw-cal { margin-top:auto; padding-top:16px; border-top:0.5px solid ${T.line};
          display:flex; flex-direction:column; gap:8px; }
.aw-callabel { display:flex; align-items:center; gap:9px; font-size:12px; color:${T.text3}; }
.aw-calinput { width:100%; background:${T.raised}; border:0.5px solid #2A3646;
               border-radius:8px; color:${T.text}; font:inherit; font-size:12.5px;
               padding:7px 10px; transition:border-color .3s ease; }
.aw-calinput:focus { border-color:#42536B; }
.aw-calinput::placeholder { color:${T.text4}; }
.aw-calnote { font-size:11px; color:${T.text4}; line-height:1.45; }

/* ---------- path bar ---------- */
.aw-path { position:relative; display:flex; align-items:center; gap:0; margin-bottom:16px; }
.aw-chip { flex:1 1 0; min-width:0; display:flex; flex-direction:column; align-items:center;
           gap:6px; background:none; border:none; font:inherit; cursor:pointer; padding:0; }
.aw-chipdot { width:30px; height:30px; border-radius:50%; display:flex; align-items:center;
              justify-content:center; position:relative;
              transition:background .5s ease, border-color .5s ease, transform .4s ease; }
.aw-chip.on .aw-chipdot { transform:scale(1.16); }
.aw-chipcore { width:9px; height:9px; border-radius:50%; transition:background .5s ease; }
.aw-chipname { font-size:11px; color:${T.text4}; max-width:100%; overflow:hidden;
               text-overflow:ellipsis; white-space:nowrap; transition:color .4s ease; }
.aw-chip.on .aw-chipname, .aw-chip.done .aw-chipname { color:${T.text2}; }
.aw-chiplink { flex:0 0 auto; width:100%; height:0.5px; background:${T.lineSoft};
               margin-top:-18px; }
.aw-wake2 { position:absolute; inset:-4px; border-radius:50%; border:1px solid currentColor;
            pointer-events:none; animation: awWake 800ms cubic-bezier(.22,1,.36,1) 1 forwards; }
@keyframes awWake { 0%{opacity:.9; transform:scale(1)} 100%{opacity:0; transform:scale(1.5)} }

.aw-paper { position:absolute; top:0; left:0; width:22px; height:15px; border-radius:2px;
            background:${T.paper}; z-index:5; pointer-events:none;
            animation: awFly 900ms cubic-bezier(.22,1,.36,1) forwards; }
@keyframes awFly {
  0%   { transform: translate(var(--x0), var(--y0)) rotate(-8deg); opacity:0 }
  14%  { opacity:1 }
  50%  { transform: translate(var(--xm), var(--ym)) rotate(5deg); }
  86%  { opacity:1 }
  100% { transform: translate(var(--x1), var(--y1)) rotate(0deg); opacity:0 }
}

/* ---------- stage: one person's page ---------- */
.aw-stage { position:relative; flex:1 1 auto; min-height:190px; border-radius:14px;
            padding:22px; overflow:hidden;
            animation: awStageIn 620ms cubic-bezier(.22,1,.36,1) both; }
@keyframes awStageIn {
  from { opacity:0; transform:translateX(34px) scale(.985) }
  to   { opacity:1; transform:none }
}
.aw-stage h2 { margin:0; font-size:clamp(20px,3vw,28px); font-weight:600; letter-spacing:-0.02em;
               overflow-wrap:anywhere; }
.aw-stagerole { font-size:12.5px; color:${T.text3}; margin-top:4px; }
.aw-stagemsg { font-size:15px; line-height:1.6; margin-top:20px; max-width:56ch;
               animation: awUp .5s ease both; }
.aw-scan { position:absolute; left:0; right:0; height:1px; top:0; pointer-events:none;
           background:rgba(255,255,255,.5); opacity:.14;
           animation: awScan 3.4s ease-in-out infinite; }
@keyframes awScan { 0%{ transform:translateY(0) } 50%{ transform:translateY(190px) } 100%{ transform:translateY(0) } }
.aw-dots { display:inline-flex; gap:5px; margin-left:8px; vertical-align:middle; }
.aw-dots i { width:4px; height:4px; border-radius:50%; background:currentColor;
             animation: awBlink 1.4s ease-in-out infinite; }
.aw-dots i:nth-child(2){ animation-delay:.18s } .aw-dots i:nth-child(3){ animation-delay:.36s }
@keyframes awBlink { 0%,100%{opacity:.25} 50%{opacity:1} }
.aw-empty { display:flex; flex-direction:column; align-items:center; justify-content:center;
            height:100%; gap:10px; text-align:center; }

/* ---------- shelf, bar, feed ---------- */
.aw-shelf { margin-top:14px; border:0.5px dashed ${T.lineSoft}; border-radius:12px;
            padding:12px 14px; flex:0 0 auto; }
.aw-doclist { display:flex; gap:10px; overflow-x:auto; padding-bottom:2px; }
.aw-doc { width:112px; height:64px; flex:none; border-radius:4px; background:${T.paper};
          color:${T.paperInk}; padding:10px 11px; text-align:left; border:none; cursor:pointer;
          font:inherit; animation: awLand 620ms cubic-bezier(.22,1,.36,1) both;
          transition:transform .2s ease; }
.aw-doc:hover { transform:translateY(-3px); }
@keyframes awLand { from{opacity:0; transform:translateY(-18px) rotate(-3deg)} to{opacity:1; transform:none} }

.aw-bar { margin-top:14px; display:flex; align-items:center; gap:10px; background:${T.raised};
          border:0.5px solid #2A3646; border-radius:12px; padding:11px 13px; flex-wrap:wrap;
          transition:border-color .4s ease; }
.aw-bar:focus-within { border-color:#42536B; }
.aw-input { flex:1 1 200px; background:none; border:none; color:${T.text}; font:inherit;
            font-size:14px; padding:4px 0; min-width:0; }
.aw-input::placeholder { color:${T.text3}; }
.aw-pill { font-size:12px; color:${T.text4}; background:none; border:0.5px solid transparent;
           border-radius:7px; padding:4px 9px; cursor:pointer; font:inherit;
           transition:color .3s ease, border-color .3s ease; }
.aw-pill.on { color:${T.text2}; border-color:#2A3646; }
.aw-go { font-size:13px; font-weight:500; border-radius:8px; padding:8px 16px; cursor:pointer;
         border:0.5px solid rgba(139,92,246,.55); background:rgba(139,92,246,.16);
         color:#C4B5FD; font-family:inherit; transition:background .3s ease, border-color .3s ease; }
.aw-go:hover:not([disabled]) { background:rgba(139,92,246,.28); border-color:rgba(139,92,246,.85); }
.aw-go[disabled] { opacity:.4; cursor:default; }

.aw-feedline { font-size:12.5px; color:${T.text2}; line-height:1.55; margin-bottom:12px;
               animation: awIn 420ms ease both; }
.aw-feedline.now { color:${T.text}; }
.aw-feedline.err { color:#F0A0BC; }
@keyframes awIn { from{opacity:0; transform:translateY(5px)} to{opacity:1; transform:none} }

.aw-person { display:flex; align-items:center; gap:9px; margin-bottom:14px; width:100%;
             background:none; border:none; font:inherit; cursor:pointer; padding:0; text-align:left; }
.aw-pname { font-size:13.5px; flex:1 1 auto; min-width:0; overflow:hidden;
            text-overflow:ellipsis; white-space:nowrap; }
.aw-dot { width:7px; height:7px; border-radius:50%; flex:none; transition:background .4s ease; }
.aw-stat { font-size:11px; margin-left:auto; flex:none; }
.aw-lamp { animation: awLamp 2s ease-in-out infinite; }
@keyframes awLamp { 0%,100%{opacity:.4} 50%{opacity:1} }

.aw-open { position:absolute; inset:0; background:${T.paper}; color:${T.paperInk};
           border-radius:14px; padding:28px; z-index:9; overflow:auto;
           animation: awOpen 440ms cubic-bezier(.22,1,.36,1) both; }
@keyframes awOpen { from{opacity:0; transform:scale(.96) translateY(10px)} to{opacity:1; transform:none} }
.aw-open h3 { font-size:22px; font-weight:600; margin:0 0 5px; }
.aw-rule { height:0.5px; background:#C9C6BE; margin:16px 0; }
.aw-open p { font-size:14.5px; line-height:1.7; margin:0 0 10px; max-width:62ch;
             white-space:pre-wrap; }
.aw-open p.aw-bullet { padding-left:20px; position:relative; margin-bottom:5px; }
.aw-open p.aw-bullet::before { content:'\u2022'; position:absolute; left:5px; color:#8A857C; }
.aw-open p.aw-h { margin-top:18px; margin-bottom:6px; }
.aw-open a { color:#2F5AA8; text-decoration:underline; text-underline-offset:2px; }
.aw-open a:hover { color:#1B3C7A; }
.aw-print p.aw-bullet { padding-left:14pt; }

/* ---------- history ---------- */
.aw-hist { flex:0 0 auto; margin-bottom:14px; padding-bottom:14px;
           border-bottom:0.5px solid ${T.line}; display:flex; flex-direction:column; gap:5px;
           max-height:34vh; overflow-y:auto; }
.aw-histitem { font:inherit; font-size:12px; line-height:1.4; text-align:left; cursor:pointer;
               background:none; border:0.5px solid transparent; border-radius:8px;
               padding:7px 9px; color:${T.text3};
               display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
               overflow:hidden;
               transition:color .25s ease, border-color .25s ease, background .25s ease; }
.aw-histitem:hover { color:${T.text2}; border-color:${T.line}; }
.aw-histitem.on { color:${T.text}; border-color:rgba(139,92,246,.55);
                  background:rgba(139,92,246,.11); }
.aw-histitem i { font-style:normal; color:#8B5CF6; }
.aw-oldbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap;
             font-size:11.5px; color:#FCD34D; margin-bottom:12px;
             background:rgba(245,158,11,.10); border:0.5px solid rgba(245,158,11,.34);
             border-radius:9px; padding:7px 10px; }
.aw-x { position:absolute; top:18px; right:18px; font-size:12px; color:#6B6862;
        background:none; border:0.5px solid #C9C6BE; border-radius:7px; padding:5px 12px;
        cursor:pointer; font-family:inherit; }

/* setup */
.aw-setup { position:relative; flex:1 1 auto; display:flex; align-items:center;
            justify-content:center; padding:20px 0; overflow:auto; }
.aw-card { width:100%; max-width:470px; background:${T.panel}; border:0.5px solid ${T.line};
           border-radius:16px; padding:26px; animation: awUp .55s cubic-bezier(.22,1,.36,1) both; }
.aw-card h2 { font-size:22px; font-weight:600; margin:0 0 6px; }
.aw-field { display:flex; align-items:center; gap:12px; margin-top:14px;
            animation: awUp .5s cubic-bezier(.22,1,.36,1) both; }
.aw-field label { font-size:12.5px; color:${T.text3}; flex:1 1 auto; min-width:0; }
.aw-nameinput { width:168px; flex:none; background:${T.raised}; border:0.5px solid #2A3646;
                border-radius:8px; color:${T.text}; font:inherit; font-size:14px; padding:8px 11px;
                transition:border-color .3s ease; }
.aw-nameinput:focus { border-color:#42536B; }
.aw-nameinput::placeholder { color:${T.text4}; }
.aw-nameinput.aw-wide { width:100%; }
.aw-teamfield { display:flex; flex-direction:column; gap:8px; margin-top:20px;
                padding-bottom:18px; border-bottom:0.5px solid ${T.line};
                animation: awUp .5s cubic-bezier(.22,1,.36,1) .06s both; }

@media (max-width:600px) {
  .aw { padding:12px; -webkit-font-smoothing:antialiased; }
  .aw-head { padding:2px 2px 10px; gap:8px; }
  .aw-tabs { margin-left:0; width:100%; }
  .aw-col { padding:14px; border-radius:12px; }
  .aw-stage { padding:18px; }
  .aw-chipname { font-size:10px; }
  .aw-chipdot { width:26px; height:26px; }
  .aw-pill { min-height:32px; padding:5px 10px; }
  .aw-go { min-height:42px; padding:10px 18px; flex:1 1 auto; }
  .aw-open { position:fixed; inset:0; border-radius:0; padding:22px; z-index:80; }
  .aw-card { padding:20px; }
  .aw-cal { margin-top:20px; }
}
@media (max-width:400px) {
  .aw-field { flex-wrap:wrap; gap:8px; }
  .aw-nameinput { width:100%; }
}

.aw-dl { font:inherit; font-size:11.5px; color:#6B6862; background:none;
         border:0.5px solid #C9C6BE; border-radius:7px; padding:5px 11px; cursor:pointer;
         transition:background .2s ease, color .2s ease; }
.aw-dl:hover { background:#EAE7E0; color:#2C2C2A; }
.aw-dlsm { font:inherit; font-size:11.5px; color:${T.text3}; background:none;
           border:0.5px solid ${T.line}; border-radius:7px; padding:4px 10px; cursor:pointer;
           transition:color .3s ease, border-color .3s ease; }
.aw-dlsm:hover:not([disabled]) { color:${T.text2}; border-color:#3A4453; }
.aw-dlsm[disabled] { opacity:.4; cursor:default; }
.aw-dlsm.ok { color:#6EE7B7; border-color:rgba(16,185,129,.5); }

/* print sheet — only thing visible when the browser prints */
.aw-print { display:none; }
@media print {
  .aw { display:none !important; }
  .aw-print { display:block !important; color:#111;
              font-family:'Instrument Sans', ui-sans-serif, system-ui, sans-serif; }
  .aw-print h1 { font-size:21pt; font-weight:600; margin:0 0 3pt; }
  .aw-print h2 { font-size:13.5pt; font-weight:600; margin:0 0 3pt; }
  .aw-print .aw-pmeta { font-size:9pt; color:#666; margin:0 0 12pt; }
  .aw-print p { font-size:11pt; line-height:1.6; margin:0 0 6pt; white-space:pre-wrap; }
  .aw-print hr { border:none; border-top:0.5pt solid #bbb; margin:14pt 0; }
  .aw-print section { break-inside:auto; page-break-inside:auto; margin-bottom:18pt; }
  .aw-print h2 { break-after:avoid; page-break-after:avoid; }
  html, body, #root { height:auto !important; min-height:0 !important;
                      background:#fff !important; }
  .aw-print { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .aw-print .aw-phead { display:flex; align-items:center; gap:7pt;
                        margin:0 0 12pt; padding-bottom:7pt;
                        border-bottom:0.75pt solid #333;
                        font-size:11.5pt; font-weight:600; letter-spacing:-0.01em; }
  .aw-print .aw-pq { font-size:10.5pt; line-height:1.5; color:#222;
                     margin:0 0 16pt; padding:9pt 11pt; background:#F2F0EC;
                     border-left:2pt solid #8B5CF6; }
  .aw-print .aw-pqlabel { display:block; font-size:8.5pt; text-transform:uppercase;
                          letter-spacing:0.06em; color:#777; margin-bottom:3pt; }
  .aw-print a { color:#000; text-decoration:underline; }
  .aw-print a::after { content:" (" attr(href) ")"; font-size:8.5pt; color:#555;
                       text-decoration:none; word-break:break-all; }
  @page { margin:14mm; }

}

@media (prefers-reduced-motion: reduce) {
  .aw-glow { display:none; }
  .aw-ln, .aw-lamp, .aw-mk-live, .aw-scan, .aw-dots i { animation:none !important; }
  .aw-paper, .aw-doc, .aw-feedline, .aw-open, .aw-wake2, .aw-sweep, .aw-stage,
  .aw-word, .aw-tag, .aw-card, .aw-field { animation-duration:1ms !important; }
}
`;

/* ============================================================
   6. TEAM STATE
   ============================================================ */
let SEQ = 0;
const makeTeam = (name, names) => ({
  id: `ws-${++SEQ}`,
  name: name || "",
  names: names || { ...DEFAULT_NAMES },
  status: blankStatus(),
  feed: [], docs: [], trail: [],
  focus: null, running: false, finished: false,
  lastHandoff: null,
  instruction: "",      // the question this run is answering
  history: [],          // finished runs, oldest first
  viewing: null,        // index into history, or null for the current run
});

function reducer(state, action) {
  const patch = (id, fn) => state.map((t) => (t.id === id ? fn(t) : t));

  switch (action.type) {
    case "ADD":
      return [...state, action.team];

    case "UPDATE_TEAM":
      return patch(action.id, (t) => ({ ...t, name: action.name, names: action.names }));

    case "START":
      return patch(action.id, (t) => {
        /* park the run that just finished before clearing the board */
        const history = t.feed.length
          ? [...t.history, {
              instruction: t.instruction, at: Date.now(),
              feed: t.feed, docs: t.docs, trail: t.trail,
              status: t.status, focus: t.focus,
            }]
          : t.history;
        return {
          ...t, history, instruction: action.instruction || "",
          feed: [], docs: [], trail: ["manager"], status: blankStatus(),
          focus: null, running: true, finished: false, lastHandoff: null,
          viewing: null,
        };
      });

    case "RESET":
      return patch(action.id, (t) => ({
        ...t, feed: [], docs: [], trail: [], status: blankStatus(),
        focus: null, running: false, finished: false, lastHandoff: null,
        instruction: "", viewing: null,
      }));

    case "FAIL":
      return patch(action.id, (t) => ({
        ...t, running: false,
        feed: [...t.feed, { message: action.message, type: "error" }],
      }));

    case "VIEW":
      return patch(action.id, (t) => ({ ...t, viewing: action.index }));

    case "FOCUS":
      return patch(action.id, (t) => {
        if (t.viewing != null) {
          return {
            ...t,
            history: t.history.map((h, i) =>
              i === t.viewing ? { ...h, focus: action.agent } : h),
          };
        }
        return { ...t, focus: action.agent };
      });

    case "EVENT": {
      const ev = action.ev;
      return patch(action.id, (t) => {
        const n = t.names;
        const next = { ...t, feed: [...t.feed, { message: fill(ev.message, n), type: ev.type }] };

        if (ev.type === "thinking" || ev.type === "tool_call") {
          next.status = { ...t.status, [ev.agent]: "on" };
          next.focus = ev.agent;
          if (!next.trail.includes(ev.agent)) next.trail = [...next.trail, ev.agent];
        }
        if (ev.type === "handoff") {
          const { from, to } = ev.payload || {};
          if (from && to) {
            next.status = { ...t.status, [from]: "done", [to]: "on" };
            next.focus = to;
            next.trail = next.trail.includes(to) ? next.trail : [...next.trail, to];
            next.lastHandoff = { from, to, id: Date.now() + Math.random() };
          }
        }
        if (ev.type === "artifact") {
          const key = ev.payload?.doc;
          const src = key ? I18N[action.lang].docs[key]
                          : { title: ev.payload?.title || "Document", body: ev.payload?.body || [] };
          next.docs = [...t.docs, {
            title: fill(src.title, n),
            body: (src.body || []).map((b) => fill(b, n)),
            id: ev.payload?.id,
            agent: ev.agent, final: !!ev.payload?.final,
          }];
        }
        if (ev.type === "done") {
          /* live mode: the manager's closing message is the real answer —
             turn it into a document so the shelf holds something readable */
          if (!USE_MOCK && ev.message && ev.message.trim()) {
            next.docs = [...next.docs, {
              title: I18N[action.lang].ui.finalDoc,
              body: [fill(ev.message.trim(), n)],
              agent: ev.agent, final: true,
            }];
          }
          next.status = Object.fromEntries(
            Object.keys(t.status).map((k) => [k, t.status[k] === "off" ? "off" : "done"])
          );
          next.running = false; next.finished = true;
        }
        return next;
      });
    }
    default:
      return state;
  }
}

/* ============================================================
   7. DOWNLOADS
   ============================================================ */
function saveBlob(filename, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const safeName = (s) =>
  (s || "document").replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "-").slice(0, 60) || "document";

function docToText(doc, team, t, md) {
  const h = md ? "# " : "";
  const lines = [
    `${h}${doc.title}`, "",
    `${t.ui.preparedBy}: ${team?.names?.[doc.agent] || ""}`,
  ];
  if (team?.name) lines.push(`${t.ui.team}: ${team.name}`);
  lines.push(new Date().toLocaleDateString(), "", ...doc.body);
  return lines.join("\n");
}

function allToText(team, t, md) {
  const head = md ? "# " : "";
  const sub = md ? "## " : "";
  const out = [`${head}${team?.name || "AI Workforce"}`, new Date().toLocaleDateString(), ""];
  team.docs.forEach((d) => {
    out.push(`${sub}${d.title}`, `${t.ui.preparedBy}: ${team.names[d.agent]}`, "", ...d.body, "");
  });
  return out.join("\n");
}

/* ============================================================
   7b. MARKDOWN RENDERING
   The model answers in Markdown. Render bold, bullets, headings
   and real links instead of showing the raw syntax.
   ============================================================ */
function inline(text) {
  const parts = String(text)
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
    .filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer">
          {link[1]}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function RichText({ text }) {
  return String(text).split("\n").map((line, i) => {
    const s = line.trim();
    if (!s) return null;
    if (/^#{1,6}\s/.test(s)) {
      return <p key={i} className="aw-h"><strong>{inline(s.replace(/^#{1,6}\s+/, ""))}</strong></p>;
    }
    const bullet = /^[*-]\s+/.test(s);
    return (
      <p key={i} className={bullet ? "aw-bullet" : ""}>
        {inline(bullet ? s.replace(/^[*-]\s+/, "") : s)}
      </p>
    );
  });
}

/* ============================================================
   8. APP
   ============================================================ */
const INTRO_MS = 6800;

export default function AIWorkforce() {
  const [phase, setPhase] = useState("intro");        // intro | setup | app
  const [editingId, setEditingId] = useState(null);   // null while creating a new team
  const [lang, setLang] = useState("en");

  const [teams, dispatch] = useReducer(reducer, []);
  const [activeId, setActiveId] = useState(null);

  const [draft, setDraft] = useState(DEFAULT_NAMES);
  const [teamDraft, setTeamDraft] = useState("");
  const [input, setInput] = useState("");
  const [fly, setFly] = useState(null);
  const [openDoc, setOpenDoc] = useState(null);
  const [printJob, setPrintJob] = useState(null);
  const [docText, setDocText] = useState(null);

  const [conn, setConn] = useState("down");           // live | down
  const [calEmail, setCalEmail] = useState("");
  const [calState, setCalState] = useState("idle");   // idle | checking | waiting | connected
  const [calNote, setCalNote] = useState("");

  const pathRef = useRef(null);
  const chipRefs = useRef({});
  const feedRef = useRef(null);
  const glowRef = useRef(null);
  const sourcesRef = useRef({});
  const hubRef = useRef(null);
  const langRef = useRef(lang);
  const seenHandoff = useRef(null);
  const calTimer = useRef(null);
  useEffect(() => { langRef.current = lang; }, [lang]);

  const t = I18N[lang];
  const team = teams.find((x) => x.id === activeId) || null;

  /* intro timer */
  useEffect(() => {
    if (phase !== "intro") return;
    const id = setTimeout(() => setPhase("setup"), INTRO_MS);
    return () => clearTimeout(id);
  }, [phase]);

  /* cursor light, drawn outside React */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2, x = tx, y = ty, raf;
    const move = (e) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.13; y += (ty - y) * 0.13;
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${x - 140}px, ${y - 140}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  /* live mode: one connection, events routed by workspace_id */
  useEffect(() => {
    if (USE_MOCK) return;
    if (!hubRef.current) hubRef.current = makeLiveHub();
    const offStatus = hubRef.current.onStatus(setConn);
    const offEvents = hubRef.current.subscribe((ev) => {
      if (!ev.workspace_id) return;
      dispatch({ type: "EVENT", id: ev.workspace_id, ev, lang: langRef.current });
    });
    return () => { offStatus(); offEvents(); };
  }, []);

  /* stop polling the calendar when the app goes away */
  useEffect(() => () => clearInterval(calTimer.current), []);

  /* the flying page — only for the team currently on screen */
  useEffect(() => {
    const h = team?.lastHandoff;
    if (!h || seenHandoff.current === h.id) return;
    seenHandoff.current = h.id;
    const bar = pathRef.current, a = chipRefs.current[h.from], b = chipRefs.current[h.to];
    if (!bar || !a || !b) return;
    const r = bar.getBoundingClientRect(), ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const x0 = ra.left - r.left + ra.width / 2 - 11, y0 = ra.top - r.top + ra.height / 2 - 7;
    const x1 = rb.left - r.left + rb.width / 2 - 11, y1 = rb.top - r.top + rb.height / 2 - 7;
    setFly({ id: h.id, x0, y0, x1, y1, xm: (x0 + x1) / 2, ym: (y0 + y1) / 2 - 30 });
    const id = setTimeout(() => setFly(null), 950);
    return () => clearTimeout(id);
  }, [team?.lastHandoff]);

  /* auto-open the final document */
  useEffect(() => {
    if (team?.viewing != null) return;          // don't pop docs while browsing history
    const last = team?.docs?.[team.docs.length - 1];
    if (last?.final) { const id = setTimeout(() => setOpenDoc(last), 700); return () => clearTimeout(id); }
  }, [team?.docs, team?.viewing]);

  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; },
            [team?.feed, team?.viewing]);


    /* documents arrive as an id only; pull the text when one is opened */
  useEffect(() => {
    setDocText(null);
    if (!openDoc || openDoc.body.length || !openDoc.id) return;
    let alive = true;
    fetch(`${API_BASE}/api/admin/artifacts/${openDoc.id}`,
          { headers: { "X-Admin-Key": ADMIN_KEY } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j) return;
        setDocText(typeof j.content === "string"
          ? j.content : JSON.stringify(j.content, null, 2));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [openDoc]);

  /* printing: render the sheet, let the browser print it, then clear */
  useEffect(() => {
    if (!printJob) return;
    const prevTitle = document.title;
    document.title = safeName(printJob.title);
    const id = setTimeout(() => {
      window.print();
      document.title = prevTitle;
      setPrintJob(null);
    }, 80);
    return () => { clearTimeout(id); document.title = prevTitle; };
  }, [printJob]);

  const dlDoc = (doc, kind) => {
    if (kind === "pdf") {
      const run = team ? (team.viewing != null ? team.history[team.viewing] : team) : null;
      setPrintJob({
        title: doc.title, subtitle: team?.name || "",
        question: run?.instruction || "",
        sections: [{ title: doc.title, author: team?.names[doc.agent], body: doc.body }],
      });
      return;
    }
    const md = kind === "md";
    saveBlob(`${safeName(doc.title)}.${md ? "md" : "txt"}`,
             docToText(doc, team, t, md), md ? "text/markdown" : "text/plain");
  };

  const dlAll = (kind) => {
    const run = team ? (team.viewing != null ? team.history[team.viewing] : team) : null;
    if (!run || !run.docs.length) return;
    const label = team.name || "AI Workforce";
    if (kind === "pdf") {
      setPrintJob({
        title: label, subtitle: label,
        question: run?.instruction || "",
        sections: run.docs.map((d) => ({ title: d.title, author: team.names[d.agent], body: d.body })),
      });
      return;
    }
    const md = kind === "md";
    saveBlob(`${safeName(label)}.${md ? "md" : "txt"}`,
             allToText({ ...team, docs: run.docs }, t, md),
             md ? "text/markdown" : "text/plain");
  };

  /* ---------- calendar ---------- */
  const calendarConnected = async (email) => {
    try {
      const r = await fetch(`${API_BASE}/api/calendar/status?email=${encodeURIComponent(email)}`);
      if (!r.ok) return false;
      const j = await r.json();
      return !!j.connected;
    } catch (e) { return false; }
  };

  const connectCalendar = async () => {
    const email = calEmail.trim();
    if (!email) return;
    setCalNote("");
    setCalState("checking");

    if (await calendarConnected(email)) { setCalState("connected"); return; }

    try {
      const r = await fetch(`${API_BASE}/api/calendar/connect`, {
        headers: { "X-Admin-Key": ADMIN_KEY },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      if (!j.auth_url) throw new Error("no auth_url");

      window.open(j.auth_url, "_blank", "noopener,noreferrer");
      setCalState("waiting");

      clearInterval(calTimer.current);
      let tries = 0;
      calTimer.current = setInterval(async () => {
        tries += 1;
        if (await calendarConnected(email)) {
          clearInterval(calTimer.current);
          setCalState("connected");
        } else if (tries >= 30) {          // give up after ~2 minutes
          clearInterval(calTimer.current);
          setCalState("idle");
        }
      }, 4000);
    } catch (e) {
      setCalState("idle");
      setCalNote(t.ui.calFail);
    }
  };

  const calLabel =
    calState === "connected" ? t.ui.calConnected
    : calState === "checking" ? t.ui.calChecking
    : calState === "waiting" ? t.ui.calWaiting
    : t.ui.calConnect;

  /* ---------- actions ---------- */
  const sourceFor = (id) => {
    if (!USE_MOCK) return hubRef.current || (hubRef.current = makeLiveHub());
    if (!sourcesRef.current[id]) {
      const src = makeMockSource(id);
      src.subscribe((ev) => dispatch({ type: "EVENT", id, ev, lang: langRef.current }));
      sourcesRef.current[id] = src;
    }
    return sourcesRef.current[id];
  };

  function commitSetup() {
    const names = Object.fromEntries(
      PEOPLE.map((p) => [p.key, (draft[p.key] || "").trim() || p.default])
    );
    const nm = teamDraft.trim();
    if (editingId) {
      dispatch({ type: "UPDATE_TEAM", id: editingId, name: nm, names });
    } else {
      const nt = makeTeam(nm, names);
      dispatch({ type: "ADD", team: nt });
      setActiveId(nt.id);
      sourceFor(nt.id);
    }
    setEditingId(null);
    setPhase("app");
  }

  const openNewTeam = () => {
    setEditingId(null); setDraft(DEFAULT_NAMES); setTeamDraft(""); setPhase("setup");
  };
  const openRename = () => {
    if (!team) return;
    setEditingId(team.id); setDraft(team.names); setTeamDraft(team.name); setPhase("setup");
  };

  const start = () => {
    if (!team || team.running || !input.trim()) return;
    setOpenDoc(null);
    dispatch({ type: "START", id: team.id, instruction: input });
    const sent = input;
    setInput("");
    Promise.resolve(
      sourceFor(team.id).sendTask({
        instruction: sent, workspace_id: team.id, language: lang,
        names: team.names, team_name: team.name || null,
      })
    ).catch(() => dispatch({ type: "FAIL", id: team.id, message: t.ui.sendFail }));
  };

  const reset = () => {
    if (!team) return;
    sourcesRef.current[team.id]?.stop?.();
    dispatch({ type: "RESET", id: team.id });
    setOpenDoc(null); setInput("");
  };

  /* ---------- shared bits ---------- */
  const ambience = (
    <>
      <div className={"aw-bg" + (fly ? " quiet" : "")} aria-hidden="true">
        {[0, -1.25, -2.5, -3.75, -5, -6.25, -7.5, -8.75].map((d, i) => (
          <div key={i} className="aw-ln" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
      <div className="aw-glow" ref={glowRef} aria-hidden="true" />
    </>
  );

  const langPills = ["en", "ur", "zh"].map((l) => (
    <button key={l} className={"aw-pill" + (lang === l ? " on" : "")} onClick={() => setLang(l)}>
      {l === "zh" ? "中文" : l.toUpperCase()}
    </button>
  ));

  /* ---------- intro ---------- */
  if (phase === "intro") {
    return (
      <div className="aw">
        <style>{CSS}</style>
        {ambience}
        <div className="aw-splash" onClick={() => setPhase("setup")}>
          <div className="aw-marklg"><Mark size={96} animated /></div>
          <div className="aw-word"><h1>AI Workforce</h1><span className="aw-sweep" /></div>
          <div className="aw-tag">{t.ui.hint}</div>
          <div className="aw-skip">{t.ui.skip}</div>
        </div>
      </div>
    );
  }

  /* ---------- setup / rename ---------- */
  if (phase === "setup") {
    return (
      <div className="aw">
        <style>{CSS}</style>
        {ambience}
        <div className="aw-head"><Mark size={26} /><b>AI Workforce</b></div>
        <div className="aw-setup">
          <div className="aw-card">
            <h2>{t.ui.setupTitle}</h2>
            <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.5 }}>{t.ui.setupHint}</div>

            <div className="aw-teamfield">
              <label htmlFor="team-name" style={{ fontSize: 12.5, color: T.text2 }}>{t.ui.teamName}</label>
              <input id="team-name" className="aw-nameinput aw-wide" value={teamDraft}
                     placeholder={t.ui.teamHint}
                     onChange={(e) => setTeamDraft(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && commitSetup()} />
            </div>

            {PEOPLE.map((p, i) => (
              <div className="aw-field" key={p.key} style={{ animationDelay: `${0.12 + i * 0.07}s` }}>
                <span className="aw-dot" style={{ background: p.hex }} />
                <label htmlFor={`n-${p.key}`}>{t.roles[p.key]}</label>
                <input id={`n-${p.key}`} className="aw-nameinput" value={draft[p.key]}
                       onChange={(e) => setDraft({ ...draft, [p.key]: e.target.value })}
                       onKeyDown={(e) => e.key === "Enter" && commitSetup()} />
              </div>
            ))}

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22, flexWrap: "wrap" }}>
              {langPills}
              {teams.length > 0 && (
                <button className="aw-pill on" onClick={() => { setEditingId(null); setPhase("app"); }}>
                  {t.ui.close}
                </button>
              )}
              <button className="aw-go" style={{ marginLeft: "auto" }} onClick={commitSetup}>
                {editingId ? t.ui.save : t.ui.start}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- main ---------- */
  /* everything below reads `view`: either the live run or an archived one */
  const view = team ? (team.viewing != null ? team.history[team.viewing] : team) : null;
  const isOld = !!team && team.viewing != null;

  const focusP = view?.focus ? byKey[view.focus] : null;
  const focusMsg = view ? [...view.feed].reverse()[0]?.message : null;
  const stageDocs = view && view.focus ? view.docs.filter((d) => d.agent === view.focus) : [];
    /* the final answer is already a document; the feed shows progress only */
  const feedLines = view ? view.feed.filter((f) => f.type !== "done") : [];

  return (
    <>
    <div className={"aw" + (team?.finished ? " lit" : "")}>
      <style>{CSS}</style>
      {ambience}

      <div className="aw-head">
        <Mark size={26} live={!!team?.running} />
        <b>AI Workforce</b>
        {!USE_MOCK && (
          <span className="aw-conn">
            <span className="aw-dot" style={{ background: conn === "live" ? "#10B981" : "#D4537E" }} />
            {conn === "live" ? t.ui.connLive : t.ui.connDown}
          </span>
        )}
        <div className="aw-tabs">
          {teams.map((tm) => (
            <button key={tm.id} className={"aw-tab" + (tm.id === activeId ? " on" : "")}
                    onClick={() => { setActiveId(tm.id); setOpenDoc(null); }}>
              <i className={tm.running ? "live" : tm.finished ? "done" : ""} />
              <span>{tm.name || `${t.ui.team} ${teams.indexOf(tm) + 1}`}</span>
            </button>
          ))}
          <button className="aw-new" onClick={openNewTeam}>+ {t.ui.newTeam}</button>
        </div>
      </div>

      <div className="aw-grid">
        {/* LEFT — roster */}
        <aside className="aw-col aw-team">
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: team?.name ? 14 : 12, fontWeight: team?.name ? 500 : 400,
                           color: team?.name ? T.text : T.text3, minWidth: 0, overflow: "hidden",
                           textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {team?.name || t.ui.team}
            </span>
            <button className="aw-pill" style={{ marginLeft: "auto" }} onClick={openRename}>
              {t.ui.rename}
            </button>
          </div>
          {PEOPLE.map((p) => {
            const st = view?.status[p.key] || "off";
            return (
              <button key={p.key} className="aw-person"
                      onClick={() => team && dispatch({ type: "FOCUS", id: team.id, agent: p.key })}>
                <span className={"aw-dot" + (st === "on" ? " aw-lamp" : "")}
                      style={{ background: st === "off" ? T.text4 : p.hex }} />
                <span className="aw-pname" title={team?.names[p.key]}
                      style={{ color: st === "off" ? T.text3 : p.tint }}>
                  {team?.names[p.key]}
                </span>
                <span className="aw-stat" style={{ color: st === "on" ? T.text2 : T.text4 }}>
                  {t.status[st]}
                </span>
              </button>
            );
          })}

          {/* calendar connect */}
          <div className="aw-cal">
            <div className="aw-callabel">
              <span className="aw-dot"
                    style={{ background: calState === "connected" ? "#10B981" : T.text4 }} />
              <span>{t.ui.calendar}</span>
            </div>
            <input className="aw-calinput" type="email" value={calEmail}
                   placeholder={t.ui.calEmail}
                   disabled={calState === "connected"}
                   onChange={(e) => setCalEmail(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && connectCalendar()} />
            <button className={"aw-dlsm" + (calState === "connected" ? " ok" : "")}
                    disabled={!calEmail.trim() || calState === "checking" || calState === "connected"}
                    onClick={connectCalendar}>
              {calLabel}
            </button>
            <div className="aw-calnote">{calNote || t.ui.calHint}</div>
          </div>
        </aside>

        {/* CENTRE — path bar + one person's page */}
        <main className="aw-col aw-main" style={{ position: "relative" }}>
          {isOld && (
            <div className="aw-oldbar">
              <span>{t.ui.viewingOld}</span>
              <button className="aw-dlsm" style={{ marginLeft: "auto" }}
                      onClick={() => { setOpenDoc(null);
                        dispatch({ type: "VIEW", id: team.id, index: null }); }}>
                {t.ui.backToLatest}
              </button>
            </div>
          )}
          <div className="aw-path" ref={pathRef}>
            {PEOPLE.map((p, i) => {
              const st = view?.status[p.key] || "off";
              const isFocus = view?.focus === p.key;
              return (
                <React.Fragment key={p.key}>
                  {i > 0 && <div className="aw-chiplink" />}
                  <button className={"aw-chip" + (st === "on" ? " on" : st === "done" ? " done" : "")}
                          onClick={() => team && dispatch({ type: "FOCUS", id: team.id, agent: p.key })}
                          title={team?.names[p.key]}>
                    <span ref={(el) => (chipRefs.current[p.key] = el)} className="aw-chipdot"
                          style={{
                            background: st === "off" ? "rgba(255,255,255,.03)" : `rgba(${p.rgb},.16)`,
                            border: `1px solid ${st === "off" ? T.line
                              : isFocus ? `rgba(${p.rgb},.9)` : `rgba(${p.rgb},.42)`}`,
                            color: p.hex,
                          }}>
                      <span className="aw-chipcore"
                            style={{ background: st === "off" ? T.text4 : p.hex }} />
                      {st === "on" && <span className="aw-wake2" />}
                    </span>
                    <span className="aw-chipname">{firstName(team?.names[p.key])}</span>
                  </button>
                </React.Fragment>
              );
            })}
            {fly && (
              <div key={fly.id} className="aw-paper" style={{
                "--x0": `${fly.x0}px`, "--y0": `${fly.y0}px`,
                "--xm": `${fly.xm}px`, "--ym": `${fly.ym}px`,
                "--x1": `${fly.x1}px`, "--y1": `${fly.y1}px`,
              }} />
            )}
          </div>

          {focusP ? (
            <div className="aw-stage" key={team.id + focusP.key + String(team.viewing)}
                 style={{ background: `rgba(${focusP.rgb},.09)`,
                          border: `0.5px solid rgba(${focusP.rgb},.34)`, color: focusP.hex }}>
              {view.status[focusP.key] === "on" && <span className="aw-scan" />}
              <h2 style={{ color: focusP.tint }}>{team.names[focusP.key]}</h2>
              <div className="aw-stagerole">{t.roles[focusP.key]}</div>
              <div className="aw-stagemsg" style={{ color: T.text }}>
                {focusMsg}
                {view.status[focusP.key] === "on" &&
                  <span className="aw-dots" style={{ color: focusP.tint }}><i /><i /><i /></span>}
              </div>
              {stageDocs.length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 10 }}>{t.ui.docsBy}</div>
                  <div className="aw-doclist">
                    {stageDocs.map((d, i) => (
                      <button key={i} className="aw-doc" onClick={() => setOpenDoc(d)}>
                        <div style={{ fontSize: 12, lineHeight: 1.25 }}>{d.title}</div>
                        <div style={{ height: "0.5px", background: "#C9C6BE", margin: "8px 0 5px" }} />
                        <div style={{ height: "0.5px", background: T.paperRule, width: "72%" }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="aw-stage" style={{ border: `0.5px dashed ${T.lineSoft}` }}>
              <div className="aw-empty">
                <Mark size={40} />
                <div style={{ fontSize: 15, color: T.text2 }}>{team?.name || t.ui.nothingYet}</div>
                <div style={{ fontSize: 12.5, color: T.text3, maxWidth: "34ch", lineHeight: 1.5 }}>
                  {t.ui.hint}
                </div>
                <button className="aw-pill on" onClick={() => setInput(t.example)}>{t.ui.example}</button>
              </div>
            </div>
          )}

          <div className="aw-shelf">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11.5, color: T.text3 }}>{t.ui.finished}</span>
              {view && view.docs.length > 0 && (
                <span style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                  <button className="aw-dlsm" onClick={() => dlAll("pdf")}>{t.ui.dlAll} · PDF</button>
                  <button className="aw-dlsm" onClick={() => dlAll("md")}>Markdown</button>
                </span>
              )}
            </div>
            {!view || view.docs.length === 0 ? (
              <div style={{ fontSize: 12, color: T.text4 }}>{t.ui.emptyShelf}</div>
            ) : (
              <div className="aw-doclist">
                {view.docs.map((d, i) => (
                  <button key={i} className="aw-doc" onClick={() => setOpenDoc(d)}>
                    <div style={{ fontSize: 12, lineHeight: 1.25 }}>{d.title}</div>
                    <div style={{ height: "0.5px", background: "#C9C6BE", margin: "8px 0 5px" }} />
                    <div style={{ height: "0.5px", background: T.paperRule, width: "72%" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="aw-bar">
            <input className="aw-input" value={input} placeholder={t.ui.placeholder}
                   disabled={!!team?.running}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && start()} />
            {langPills}
            {team?.running
              ? <button className="aw-go" onClick={reset}>{t.ui.again}</button>
              : <button className="aw-go" onClick={start} disabled={!input.trim()}>{t.ui.send}</button>}
          </div>

          {openDoc && (
            <div className="aw-open">
              <button className="aw-x" onClick={() => setOpenDoc(null)}>{t.ui.close}</button>
              <h3>{openDoc.title}</h3>
              <div style={{ fontSize: 12.5, color: "#6B6862" }}>{team?.names[openDoc.agent]}</div>
              <div className="aw-rule" />
             {openDoc.body.length
                ? openDoc.body.map((line, i) => <RichText key={i} text={line} />)
                : docText
                  ? <RichText text={docText} />
                  : <p style={{ color: "#6B6862" }}>{t.ui.noPreview}</p>} 
              <div className="aw-rule" />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11.5, color: "#6B6862" }}>{t.ui.download}</span>
                <button className="aw-dl" onClick={() => dlDoc(openDoc, "pdf")}>{t.ui.dlPdf}</button>
                <button className="aw-dl" onClick={() => dlDoc(openDoc, "txt")}>{t.ui.dlText}</button>
                <button className="aw-dl" onClick={() => dlDoc(openDoc, "md")}>{t.ui.dlMd}</button>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT — feed */}
        <aside className="aw-col aw-feed">
          {team && (team.history.length > 0 || team.instruction) && (
            <>
              <div className="aw-label">{t.ui.history}</div>
              <div className="aw-hist">
                {team.history.map((h, i) => (
                  <button key={i}
                          className={"aw-histitem" + (team.viewing === i ? " on" : "")}
                          title={h.instruction}
                          onClick={() => { setOpenDoc(null);
                            dispatch({ type: "VIEW", id: team.id, index: i }); }}>
                    {h.instruction || t.ui.askedNothing}
                  </button>
                ))}
                {team.instruction && (
                  <button className={"aw-histitem" + (team.viewing === null ? " on" : "")}
                          title={team.instruction}
                          onClick={() => { setOpenDoc(null);
                            dispatch({ type: "VIEW", id: team.id, index: null }); }}>
                    {team.running && <i>• </i>}{team.instruction}
                  </button>
                )}
              </div>
            </>
          )}

          <div className="aw-label">{t.ui.feed}</div>
          <div ref={feedRef} style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
            {feedLines.length === 0 ? (
              <div style={{ fontSize: 12.5, color: T.text4 }}>{t.ui.emptyFeed}</div>
            ) : (
              feedLines.map((f, i) => (
                <div key={i} className={"aw-feedline"
                       + (i === feedLines.length - 1 ? " now" : "")
                       + (f.type === "error" ? " err" : "")}>
                  {f.message}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>

    {/* hidden until the browser prints */}
    <div className="aw-print" aria-hidden="true">
      {printJob && (
        <>
          <div className="aw-phead">
            <Mark size={20} />
            <span>AI Workforce</span>
          </div>
          <h1>{printJob.title}</h1>
          <div className="aw-pmeta">
            {printJob.subtitle ? printJob.subtitle + " · " : ""}{new Date().toLocaleDateString()}
          </div>
          {printJob.question && (
            <div className="aw-pq">
              <span className="aw-pqlabel">Question asked</span>
              {printJob.question}
            </div>
          )}
          {printJob.sections.map((sec, i) => (
            <section key={i}>
              <h2>{sec.title}</h2>
              <div className="aw-pmeta">{t.ui.preparedBy}: {sec.author}</div>
              {sec.body.map((line, j) => <RichText key={j} text={line} />)}
              {i < printJob.sections.length - 1 && <hr />}
            </section>
          ))}
        </>
      )}
    </div>
    </>
  );
}
