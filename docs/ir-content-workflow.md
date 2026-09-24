# IR Content Template workflow

This prototype implements the yellow-star content block in Step 4 of `requirements/IR Process for oneput.pdf`. It stops at the focal point's handoff for VP endorsement. Translation and graphics layout belong to later steps.

## Report setup

Each report has its own chapter order, assigned data points, source-pack file names, setup checklist, chapter owners, due dates, draft fields, review checks, and change history. The starting chapters come from the report's existing sections. The project manager can add or reorder chapters to match the approved content structure. The approved current-year structure (Item 1 in the process appendix) was not supplied, so these starting chapters are provisional.

The setup confirmations cover signed NDA/confidentiality, approved structure, narrative flow, DJBIC/SET disclosure gaps, GRI/TCFD/IFRS requirements, IFRS-aligned template readiness, review of AI/source material, and the chapter tracker. A focal point cannot hand a chapter to its content owner until every item is confirmed and the owner is saved. The tracking CSV exports each chapter's owner, due date, stage, linked-point count, and review progress. The source pack records file names only in this prototype.

## Chapter handoff

1. PM confirms NDA access, approved structure, content flow and reporting requirements (including IFRS), and checks AI source material against previous IR books and approved CSSM content. The online template is organized per chapter with a tracking CSV.
2. The focal point links data points, records disclosure gaps, assigns an owner and due date, then sends the prepared template to the owner. The reminder control records a mock queue event against the owner and due date.
3. The owner fills the four process-form content areas: challenges/risks/impacts, commitments/targets, management approach, and performance. The AI draft preview can seed Performance from linked point inputs and source names; the separate standards-review preview flags blank areas and reminds the owner to verify evidence. Neither is a verified AI rewrite. Save retains the red drafting stage; Submit moves the chapter to orange focal-point review and records a mock CSSM notice.
4. Focal points check all seven items from the first-draft review checklist. They can return the draft to the owner with a required reason; the mock change log records that CSSM was informed. If an owner needs to edit after submission, they request reopening and provide a reason; the focal point approves the request before the chapter returns to editing. Resubmission clears previous review checks. Only a fully checked draft can be sent for VP endorsement.
5. After VP handoff, a report-level Thai/English terminology glossary can be recorded to prepare translation. Actual AI translation and the sustainability glossary service are not connected.
6. Saved text edits record before and after values. Handoffs, reopen requests and revision requests appear in the chapter history.

Data-point mapping links are candidates only. They are not claims of full disclosure coverage; reviewers must check requirements and supporting evidence. The workflow state is scoped by report in browser session storage, so it is not yet an online shared template with simultaneous multi-user access. NDA confirmation, CSSM notifications, reminders, AI standards review, file extraction and translation remain prototype controls without connected services. Closed reports are displayed read-only.
