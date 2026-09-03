from app.agents.data_agent import data_agent
from app.agents.hr_agent import hr_agent
from app.agents.research_agent import research_agent

AGENTS = {"HR": hr_agent, "Data": data_agent, "Research": research_agent}


def get_agent(name: str):
    key = (name or "").strip().lower()
    for agent_key, agent in AGENTS.items():
        if agent_key.lower() == key:
            return agent
    raise ValueError(f"Agent nahi mila: {name}. Available: {list(AGENTS)}")
