"""Question prompts for the shareable, per-data-point intake form prototype."""


def questions_for_point(point: dict) -> list[dict]:
    name = point.get("name", "this data point")
    code = point.get("code", "")
    kind = (point.get("type") or "").lower()
    prompts = []

    if kind == "quantitative":
        prompts = [
            ("value", f"What is the {point.get('unit') or 'reported value'} for {name}?", "Enter the value and unit. If it is unavailable, explain why."),
            ("period", "What reporting period does this value cover?", "Include the start and end dates or fiscal year."),
            ("method", "How was this value calculated or collected?", "Describe the method, assumptions, and any estimation used."),
            ("breakdown", "Are there useful breakdowns or comparisons?", "Add category, location, prior-year comparison, or explain why none apply."),
        ]
    elif kind == "evidence file":
        prompts = [
            ("evidence", f"What does the evidence for {name} confirm?", "Point to the relevant page, table, or section."),
            ("period", "What reporting period does the evidence cover?", "Include dates and note any period gaps."),
            ("source", "Who prepared or owns this source?", "Give the team or role and the original system or document."),
        ]
    else:
        prompts = [
            ("description", f"Describe {name} during the reporting period.", "Include scope, people or places affected, and material changes."),
            ("approach", "What policies, responsibilities, or actions manage this topic?", "Name the accountable team and how the approach works in practice."),
            ("results", "What outcomes, targets, or lessons can you report?", "Include progress, dates, and any known gaps or limitations."),
        ]

    # A few data points need clarifications beyond their collection type.
    extras = {
        "PPL-01": ("people", "How is the employee population split?", "Add available breakdowns such as gender, region, and employment type."),
        "PPL-02": ("workers", "Which non-employee workers are included?", "Describe the work performed, who controls it, and the counting method."),
        "GOV-01": ("governance", "Which bodies oversee this topic?", "Include the board, committees, roles, and relevant composition details."),
        "OPS-01": ("value-chain", "What activities and value-chain relationships should the report describe?", "Include main products or services, markets, suppliers, and other business relationships."),
    }
    if code in extras:
        prompts.append(extras[code])

    return [
        {"id": item_id, "label": label, "help": help_text, "required": index == 0}
        for index, (item_id, label, help_text) in enumerate(prompts)
    ]


def summarize_answers(questions: list[dict], answers: dict, anything_else: str, files: list[dict]) -> str:
    lines = [f"{question['label']}: {answers[question['id']].strip()}" for question in questions if answers.get(question["id"], "").strip()]
    if anything_else.strip():
        lines.append(f"Anything else: {anything_else.strip()}")
    if files:
        lines.append("Supporting files: " + ", ".join(item["name"] for item in files))
    return "\n".join(lines)[:10000]
