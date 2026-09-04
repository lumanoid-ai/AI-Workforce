"""Agent 1 — Manager. User se sirf yeh baat karta hai; kaam delegate karta hai."""
from app.core.base_agent import BaseAgent, Tool
from app.core.events import emit
from app.core.llm import llm_text
from app.database import db_session
from app.models import Task
from app.core.language import language_instruction

MANAGER_SYSTEM_PROMPT = """You are the Manager of an AI workforce with four specialists:
- HR: job descriptions, resume screening, scoring, interviews, onboarding, policy
- Data: hiring metrics, funnels, score distributions
- Research: outside information — general questions, how-to, market rates, prices, regulations, competitors, product suggestions, travel options. Returns answers with real links. Use whenever the answer isn't in our own data.
- Calendar: what's on the schedule, who's busy, upcoming birthdays and work anniversaries. Reads the calendar only — HR does the booking.

You never do specialist work yourself. You split the user's request into
delegations, then combine the specialists' summaries into one answer for the user.
Be concrete. Under 150 words, Never write, shorten, or modify a URL. If a specialist returned links, copy
them character-for-character or leave them out. A link you alter will not work.
If a specialist fails or returns an error, say plainly that you could not get
the information and why. Never fill the gap with a plausible-sounding answer.
"No data" and "the tool failed" are different things and must never be
reported as the same.."""


def delegate(agent: str, instruction: str, task_id: str | None = None, **ctx) -> dict:
    from app.agents.registry import get_agent
    emit(task_id, "Manager", "handoff", f"{agent} ko de raha hoon: {instruction[:100]}",
         {"to": agent})
    return get_agent(agent).run(instruction, context=ctx, task_id=task_id)


manager_agent = BaseAgent(
    name="Manager",
    role="Delegation and synthesis",
    system_prompt=MANAGER_SYSTEM_PROMPT,
    tools=[Tool("delegate", delegate,
            "Give a specialist agent ('HR', 'Data', 'Research' or 'Calendar') a self-contained instruction",
            {"agent": "'HR'|'Data'|'Research'|'Calendar'", "instruction": "str"})],
    color="#8B5CF6",   # purple
)


def run_task(instruction: str, workspace_id: str | None = None,
             language:str = "en") -> dict:
    """Entry point: user -> Manager -> specialists -> user."""
    db = db_session()
    try:
        task = Task(instruction=instruction, workspace_id=workspace_id)
        db.add(task)
        db.commit()
        db.refresh(task)
        task_id = task.id
    finally:
        db.close()

    result = manager_agent.run(
        instruction,
        context={"workspace_id": workspace_id, "language": language},
        task_id=task_id)

    final = llm_text(
        f"User asked: {instruction}\n\nSpecialist summaries:\n"
        f"{[r.get('result', {}).get('summary') for r in result['results']]}\n\n"
        "Write the final answer for the user.",
        system=MANAGER_SYSTEM_PROMPT + language_instruction(language),
        temperature=0.4,
    ) if result["results"] else result["summary"]

    db = db_session()
    try:
        t = db.get(Task, task_id)
        t.status = "done"
        t.result = {"answer": final, "artifacts": result["artifacts"]}
        db.commit()
    finally:
        db.close()

    emit(task_id, "Manager", "done", final[:200])
    return {"task_id": task_id, "answer": final, "artifacts": result["artifacts"]}
