# IR Content Template workflow

This prototype implements the yellow-star content block in Step 4 of `requirements/IR Process for oneput.pdf`. It stops at the focal point's handoff for VP endorsement. Translation and graphics layout belong to later steps.

## Report setup

Each report has its own chapter order, assigned data points, source-pack file names, setup checklist, chapter owners, due dates, draft fields, review checks, and change history. The starting chapters come from the report's existing sections. The project manager can add or reorder chapters to match the approved content structure. The approved current-year structure (Item 1 in the process appendix) was not supplied, so these starting chapters are provisional.

The five setup confirmations cover the content structure, narrative flow, DJBIC/SET disclosure gaps, GRI/TCFD/IFRS requirements, and chapter tracker. A focal point cannot hand a chapter to its content owner until all five are confirmed and the owner is saved. The tracking CSV exports each chapter's owner, due date, stage, linked-point count, and review progress.

## Chapter handoff

1. The focal point links data points, records disclosure gaps, assigns an owner and due date, then sends the prepared template to the owner. The reminder control records a mock queue event against the owner and due date.
2. The owner fills the four content areas shown in the process form: challenges/risks/impacts, commitments/targets, management approach, and performance. A linked data point can be inserted into the performance draft with its code and current review status. Save retains the red drafting stage; Submit moves the chapter to orange focal-point review.
3. Focal points check all seven items from the first-draft review checklist. They can return the draft to the owner with a required reason; the mock change log records that CSSM was informed. Resubmission clears the previous review checks. Only a fully checked draft can be sent for VP endorsement.
4. Every saved text edit records before and after values. Handoffs and revision requests appear in the same chapter history.

Data-point mapping links are candidates only. They are not claims of full disclosure coverage; reviewers must check requirements and supporting evidence. The source pack currently records file names only, and the workflow state is scoped by report in browser session storage. Actual reminder/email delivery, AI drafting/polishing/translation, file extraction, and simultaneous multi-user editing need backend services in a later implementation. Closed reports are displayed read-only.
