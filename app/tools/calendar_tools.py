"""Calendar reading tools. Booking stays with HR — this agent only looks."""
from app.config import settings
from app.services import google_calendar as gcal


def _inbox() -> str:
    """Whose calendar we read. HR_INBOX from .env."""
    return getattr(settings, "hr_inbox", None) or "hr@yourcompany.com"


def upcoming_events(days_ahead: int = 7) -> dict:
    """Everything on the calendar between now and N days from now."""
    email = _inbox()

    if not gcal.enabled() or not gcal.is_connected(email):
        return {"connected": False,
                "message": "Google Calendar is not connected yet. "
                           "Connect it at /api/calendar/connect.",
                "events": []}

    events = gcal.list_events(email, days_ahead=days_ahead)
    return {"connected": True, "count": len(events),
            "days_ahead": days_ahead, "events": events}


def people_events(days_ahead: int = 30) -> dict:
    """
    Birthdays and work anniversaries coming up.

    Found by keyword — real calendars are messy, and matching words is more
    reliable than trying to be clever about event types.
    """
    result = upcoming_events(days_ahead=days_ahead)
    if not result.get("connected"):
        return result

    keywords = ("birthday", "bday", "anniversary", "joined", "work anniversary")
    matches = [e for e in result["events"]
               if any(k in e["title"].lower() for k in keywords)]

    return {"connected": True, "count": len(matches), "events": matches}