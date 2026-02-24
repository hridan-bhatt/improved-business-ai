# Smart Report Generator: PDF via reportlab
from io import BytesIO
from typing import Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from services.health_score_service import get_health_score
from services.expense_service import get_expense_summary


def generate_report_pdf() -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=inch, leftMargin=inch)
    styles = getSampleStyleSheet()
    story = []
    story.append(Paragraph("Lucent AI - Executive Summary", styles["Title"]))
    story.append(Spacer(1, 0.3 * inch))
    health = get_health_score()
    story.append(Paragraph(f"Health Score: {health['score']}/100", styles["Heading2"]))
    story.append(Spacer(1, 0.2 * inch))
    expense = get_expense_summary()
    story.append(Paragraph(f"Total Expense (index): {expense['total']}", styles["Normal"]))
    story.append(Paragraph(f"Trend: {expense['trend']} ({expense['trend_percent']}%)", styles["Normal"]))
    story.append(Spacer(1, 0.3 * inch))
    data = [["Factor", "Score"]]
    for f in health["factors"]:
        data.append([f["name"], str(f["score"])])
    t = Table(data)
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
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
