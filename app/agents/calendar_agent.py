"""Agent 5 — Calendar. Reads the schedule. Booking stays with HR."""
from app.core.base_agent import BaseAgent, Tool
from app.tools.calendar_tools import people_events, upcoming_events

CALENDAR_SYSTEM_PROMPT = """You are the Calendar specialist in an AI workforce.
The Manager delegates schedule questions to you.

You handle: what is coming up, who is busy, upcoming birthdays and work
anniversaries, and how full the week looks.

Rules:
1. Only report events the tools actually returned. Never invent a meeting,
   a date, or an attendee.
2. If the calendar is not connected, say so plainly and stop. Do not guess
   what might be on it.
3. You READ the calendar. You do not book anything — interview scheduling
   belongs to HR. If asked to book, say HR handles that.
4. Give dates in a human format: "Tuesday 9 Sep, 2pm", not an ISO timestamp.
5. Report in under 100 words.
"""

CALENDAR_TOOLS = [
    Tool("upcoming_events", upcoming_events,
         "Everything on the calendar for the next N days",
         {"days_ahead": "int"}),
    Tool("people_events", people_events,
         "Upcoming birthdays and work anniversaries",
         {"days_ahead": "int"}),
]

calendar_agent = BaseAgent(
    name="Calendar",
    role="Schedule, upcoming events, birthdays and anniversaries",
    system_prompt=CALENDAR_SYSTEM_PROMPT,
    tools=CALENDAR_TOOLS,
    color="#EF9F27",   # amber
)