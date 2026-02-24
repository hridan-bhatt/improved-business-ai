# Smart Report Generator: PDF via reportlab
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from services.health_score_service import get_health_score
from services.expense_service import get_expense_summary
from database import SessionLocal


def generate_report_pdf() -> bytes:
    db = SessionLocal()
    try:
        health = get_health_score()
        expense = get_expense_summary(db)
    finally:
        db.close()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=inch, leftMargin=inch)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Lucent AI - Executive Summary", styles["Title"]))
    story.append(Spacer(1, 0.3 * inch))

    story.append(Paragraph(f"Health Score: {health['score']}/100", styles["Heading2"]))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph(f"Total Expenses: ${expense['total']}", styles["Normal"]))
    story.append(Paragraph(f"Trend: {expense['trend']} ({expense['trend_percent']}%)", styles["Normal"]))
    story.append(Spacer(1, 0.3 * inch))

    # Health factors table
    data = [["Factor", "Score"]]
    for f in health["factors"]:
        data.append([f["name"], str(f["score"])])
    t = Table(data, colWidths=[3 * inch, 1.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, 0), 12),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.3 * inch))

    # Expense breakdown table (if data exists)
    if expense.get("by_category"):
        story.append(Paragraph("Expense Breakdown by Category", styles["Heading2"]))
        story.append(Spacer(1, 0.15 * inch))
        cat_data = [["Category", "Amount ($)"]]
        for cat in expense["by_category"]:
            cat_data.append([cat["name"], f"${cat['value']:,.2f}"])
        ct = Table(cat_data, colWidths=[3 * inch, 1.5 * inch])
        ct.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTSIZE", (0, 0), (-1, 0), 11),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
            ("BACKGROUND", (0, 1), (-1, -1), colors.lightblue),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        story.append(ct)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
