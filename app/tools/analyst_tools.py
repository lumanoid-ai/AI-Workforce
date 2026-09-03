"""Bridge to Areeb's Data Analyst. His code is untouched — we just call ask()."""
import os

from dotenv import load_dotenv

load_dotenv()

_agent = None


def _get_agent():
    """Built once and reused. Uses local CSVs from ./workspace."""
    global _agent
    if _agent is None:
        from analyst.agent import DataAnalystAgent
        workspace = os.getenv("ANALYST_WORKSPACE", "./workspace")
        _agent = DataAnalystAgent(workspace)
    return _agent


def analyse_data(question: str) -> dict:
    """
    Ask the data analyst a question about the company's own data.

    It writes real SQL, runs it, and explains the result. Every number
    comes from a query — it cannot invent one.
    """
    try:
        result = _get_agent().ask(question)
    except Exception as e:
        return {"error": str(e), "narrative": f"Could not analyse the data: {e}"}

    return {
        "narrative": result.narrative,
        "sql": result.sql,
        "row_count": result.row_count,
        "tables_used": result.tables_used,
        "chart": result.chart,
        "failed": result.failed,
    }