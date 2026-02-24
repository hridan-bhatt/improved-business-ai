# Business Assistant: contextual responses using real module metrics
from typing import Any, Dict, List


def generate_business_response(question: str, module_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a structured response using real metrics from module data."""
    q = question.lower().strip()
    metrics = module_data or {}

    health = metrics.get("health", {})
    expense = metrics.get("expense", {})
    fraud = metrics.get("fraud", {})
    inventory = metrics.get("inventory", {})
    green_grid = metrics.get("green_grid", {})
    carbon = metrics.get("carbon", {})
    recommendations = metrics.get("recommendations", [])

    answer_parts: List[str] = []
    metrics_used: List[str] = []

    if "expense" in q or "spend" in q or "cost" in q or "budget" in q:
        if expense:
            total = expense.get("total", 0)
            trend = expense.get("trend", "stable")
            trend_pct = expense.get("trend_percent", 0)
            by_cat = expense.get("by_category", [])
            top = sorted(by_cat, key=lambda x: x.get("value", 0), reverse=True)[:3]
            parts = [f"**Total expenses:** ${total:,.0f} ({trend} {trend_pct:+.1f}%)"]
            if top:
                parts.append("Top categories: " + ", ".join(f"{c.get('name', '')} (${c.get('value', 0):,.0f})" for c in top))
            answer_parts.append("\n".join(parts))
            metrics_used.append("expense")
        else:
            answer_parts.append("Upload expense data in Expense Sense to get spending insights.")
    elif "fraud" in q or "risk" in q or "anomal" in q:
        if fraud:
            anomalies = fraud.get("anomalies_detected", 0)
            total_tx = fraud.get("total_transactions", 0)
            risk = fraud.get("risk_level", "unknown")
            answer_parts.append(
                f"**Fraud risk:** {risk}. {anomalies} anomalies detected out of {total_tx} transactions."
            )
            metrics_used.append("fraud")
        else:
            answer_parts.append("Upload transaction data in Fraud Lens for anomaly detection insights.")
    elif "inventory" in q or "stock" in q or "reorder" in q:
        if inventory:
            low = inventory.get("low_stock_count", 0)
            items = inventory.get("items", [])
            low_items = [i for i in items if i.get("stock", 0) <= i.get("reorder_at", 0)][:5]
            parts = [f"**Low stock items:** {low}"]
            if low_items:
                parts.append("Consider reordering: " + ", ".join(i.get("name", "") for i in low_items))
            answer_parts.append("\n".join(parts))
            metrics_used.append("inventory")
        else:
            answer_parts.append("Add inventory data in Smart Inventory for stock insights.")
    elif "health" in q or "score" in q:
        if health:
            score = health.get("score", 0)
            level = health.get("level", "unknown")
            factors = health.get("factors", [])
            parts = [f"**Business health:** {score}/100 ({level})"]
            if factors:
                parts.append("Factors: " + ", ".join(f"{f.get('name', '')}: {f.get('score', 0)}" for f in factors))
            answer_parts.append("\n".join(parts))
            metrics_used.append("health")
        else:
            answer_parts.append("Health score aggregates cash flow, fraud risk, inventory, and sustainability.")
    elif "carbon" in q or "sustainab" in q or "emission" in q:
        if carbon:
            kg = carbon.get("kg_co2_per_year", 0)
            equiv = carbon.get("equivalent", "")
            rating = carbon.get("rating", "")
            answer_parts.append(f"**Carbon footprint:** {kg:,.0f} kg CO₂/yr ({equiv}). Rating: {rating}")
            metrics_used.append("carbon")
        else:
            answer_parts.append("Carbon estimate is available from the Carbon module.")
    elif "green" in q or "energy" in q:
        if green_grid:
            usage = green_grid.get("current_usage_kwh", 0)
            savings = green_grid.get("potential_savings_percent", 0)
            recs = green_grid.get("recommendations", [])
            parts = [f"**Energy usage:** {usage:.1f} kWh. Potential savings: {savings:.0f}%"]
            if recs:
                parts.append("Recommendations: " + "; ".join(recs[:2]))
            answer_parts.append("\n".join(parts))
            metrics_used.append("green_grid")
        else:
            answer_parts.append("Upload energy data in Green Grid for usage insights.")
    elif "recommend" in q or "suggest" in q:
        if recommendations:
            parts = [f"**{len(recommendations)} recommendations:**"]
            for r in recommendations[:5]:
                parts.append(f"• {r.get('title', '')} ({r.get('priority', '')})")
            answer_parts.append("\n".join(parts))
            metrics_used.append("recommendations")
        else:
            answer_parts.append("Recommendations are generated from your module data.")
    elif any(w in q for w in ("hello", "hi", "hey")):
        answer_parts.append(
            "Hello! I'm your Business AI assistant. I can answer questions about expenses, fraud, inventory, "
            "health score, sustainability, and recommendations. Ask me anything about your business metrics."
        )
    else:
        if health or expense or fraud or inventory:
            summary = []
            if health:
                summary.append(f"Health: {health.get('score', 0)}/100")
            if expense:
                summary.append(f"Expenses: ${expense.get('total', 0):,.0f}")
            if fraud:
                summary.append(f"Fraud: {fraud.get('risk_level', 'N/A')}")
            if inventory:
                summary.append(f"Low stock: {inventory.get('low_stock_count', 0)} items")
            answer_parts.append("**Quick overview:** " + " | ".join(summary))
        answer_parts.append(
            "Ask about expenses, fraud, inventory, health score, carbon footprint, or recommendations."
        )

    content = "\n\n".join(answer_parts) if answer_parts else "I can help with business metrics. Try asking about expenses, fraud, inventory, or health."
    return {
        "answer": content,
        "metrics_used": metrics_used,
    }
