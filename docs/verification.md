# Verification

The supplied `Oneput.html` was rendered separately from the Next.js application for screenshot comparisons. Application code does not load the HTML or its bundled JavaScript.

- Production Next.js build passed locally and in Docker.
- Both Docker Compose services started successfully; FastAPI health check passed.
- 11 backend integration tests passed: demo sessions, logout invalidation, role permissions, read-only periods, review history, project/member creation, messages, uploads, preferences, data-point creation, six export formats, and revocable shares.
- Six browser integration flows passed: admin navigation/settings/audit; project creation/chat/upload/refresh; mobile member onboarding/chat; both complete tours; invitations/export downloads; point creation and persisted audit overrides.
- 23 visual comparisons covered desktop (1440 × 900 viewport) and mobile (390 × 900 viewport). All full-page dimensions matched. Detailed image measurements are in `visual-comparison.json`. In the final run, 8 states were pixel-identical; the maximum mean RGB-channel difference among the others was 0.017065 on a 0–255 scale. Small residual rendering differences remain, so this is not a claim of universal pixel identity.

The visual comparisons cover projects, new project, planning, members, member guidance, overview, financial audit, partial-answer audit, export, calendar, settings, point decisions, and member invitation. They compare the original prototype's layouts, including its constrained mobile admin layouts; this is not a mobile redesign.

To reproduce visual checks with Docker running:

```sh
node frontend/scripts/verify-visual.cjs
backend/.venv/bin/python frontend/scripts/compare-visual.py
```

PNG pairs are written to `frontend/test-results/visual`. `APP_URL` can select another frontend address. These checks use the reference file only as a test fixture, never as application runtime content.

Real OAuth, LLM document extraction, and external messaging/sync providers are not configured. They remain local demo adapters as described in the README.
