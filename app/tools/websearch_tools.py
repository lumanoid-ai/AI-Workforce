"""Web search tool — free, no API key. pip install ddgs"""


def web_search(query: str, max_results: int = 5) -> dict:
    """
    Search the web. Returns an answer-ready set of results plus real URLs.

    The LLM never writes a URL — links come from here, so they always exist.
    """
    try:
        from ddgs import DDGS
        raw = list(DDGS().text(query, max_results=max_results))
    except Exception as e:
        return {"error": f"Search unavailable: {e}", "results": [], "links": []}

    results = [{
        "title": r.get("title", ""),
        "snippet": r.get("body", "")[:400],
        "url": r.get("href", ""),
    } for r in raw if r.get("href")]

    links, seen = [], set()
    for r in results:
        domain = r["url"].split("/")[2].replace("www.", "")
        if domain in seen:
            continue
        seen.add(domain)
        links.append(f"- [{r['title'][:70]}]({r['url']}) — {domain}")
        if len(links) >= 4:
            break

    return {
        "query": query,
        "results": results,
        "links_markdown": "**Where to look:**\n" + "\n".join(links),
        "count": len(results),
    }