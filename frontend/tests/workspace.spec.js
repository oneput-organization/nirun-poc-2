const { test, expect } = require("@playwright/test");

async function signIn(page, role = "Admin") {
  await page.goto("/");
  const welcome = page.getByRole("button", {
    name: "Look around on my own",
    exact: true,
  });
  await welcome.waitFor({ state: "visible" });
  await welcome.click();
  await page.getByRole("button", { name: role, exact: true }).click();
}
async function overview(page) {
  await signIn(page);
  await page
    .getByText("ONEPUT FY2025 Annual Report", { exact: true })
    .first()
    .click();
  await expect(page.getByText("Needs you", { exact: true })).toBeVisible();
}

test("admin screens, filters, settings, calendar and audit render without errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await signIn(page);
  await page.getByRole("button", { name: "Draft", exact: true }).click();
  await expect(
    page.getByText("ONEPUT FY2026 Annual Report", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("ONEPUT FY2025 Annual Report", { exact: true }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByText("ONEPUT FY2025 Annual Report", { exact: true }).click();
  await page
    .getByRole("button", { name: "Open the calendar", exact: true })
    .click();
  await expect(
    page.locator('[data-screen-label="Collection calendar"]'),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Channels", exact: true }).click();
  await expect(page.getByText("Quiet hours", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "ONEPUT FY2025 Annual Report", exact: true })
    .click();
  await page.getByRole("button", { name: "2 more", exact: true }).click();
  await page
    .getByRole("button", { name: "Review in audit", exact: true })
    .click();
  await expect(page.locator('[data-screen-label="Audit"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test("creates a project, sends a planning message, uploads evidence and restores after refresh", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("button", { name: "New project", exact: true }).click();
  const name = `Browser test ${Date.now()}`;
  await page.locator("textarea").fill(name);
  await page.getByRole("button", { name: /Team feedback/ }).click();
  await page
    .getByRole("button", { name: "Start planning", exact: true })
    .click();
  await expect(page.locator('[data-screen-label="Planning"]')).toBeVisible();
  const input = page.getByPlaceholder("Ask Oneput anything about this project");
  await input.fill("What is still outstanding?");
  await input.press("Enter");
  await expect(
    page
      .locator(".live-chat")
      .getByText("What is still outstanding?", { exact: true }),
  ).toBeVisible();
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Attach a file", exact: true })
    .click();
  await (
    await chooser
  ).setFiles({
    name: "test-evidence.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("A supporting record"),
  });
  await expect(
    page.getByRole("link", { name: "📎 test-evidence.txt", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-screen-label="Planning"]')).toBeVisible();
  await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "📎 test-evidence.txt", exact: true }),
  ).toBeVisible();
});

test("member onboarding, guide, chat, and mobile workspace", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, "Member");
  await expect(page.locator('[data-screen-label="Invite"]')).toBeVisible();

  await page.getByRole("button", { name: /Open.*workspace/i }).click();
  const account = page.getByRole("button", {
    name: "Continue with Google",
    exact: true,
  });
  if (await account.isVisible()) await account.click();
  await page
    .getByRole("button", { name: "That is where I am", exact: true })
    .click();
  await page.getByText("FY2025 Annual Report", { exact: true }).first().click();
  await expect(page.locator('[data-screen-label="Member main"]')).toBeVisible();
  await page
    .getByPlaceholder("Type, or drop a file, I will read it")
    .fill("Here is my project update.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    page.getByText("Here is my project update.", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("both guided tours traverse every step without runtime errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const guide of ["overview", "how"]) {
    await page.goto(`/?guide=${guide}`);
    await page
      .getByRole("button", { name: "Next", exact: true })
      .last()
      .waitFor();
    for (let step = 0; step < 50; step++) {
      const next = page.getByRole("button", { name: /^(Next|Finish)$/ });
      if (await next.count()) {
        await next.last().click();
        await page.waitForTimeout(60);
      } else break;
    }
    await expect(
      page.getByRole("button", { name: /Look around/ }).last(),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("invites a member and downloads a generated export", async ({ page }) => {
  await overview(page);
  await page.getByRole("button", { name: /See all \d+ members/ }).click();
  await page.getByRole("button", { name: /Add (a )?member/i }).click();
  const name = `Contributor ${Date.now()}`;
  await page.getByPlaceholder("Their name").fill(name);
  await page
    .getByPlaceholder("@line or name@company.co")
    .fill("contributor@example.com");
  await page
    .getByRole("button", { name: "Send the invite", exact: true })
    .click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "ONEPUT FY2025 Annual Report", exact: true })
    .click();
  await page.getByRole("button", { name: "Export data", exact: true }).click();
  await page.getByRole("button", { name: /^CSV/ }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Generate/ }).click();
  expect((await download).suggestedFilename()).toMatch(/\.csv$/);
  await expect(page.getByText(/ONEPUT-fy2025-.*\.csv/).first()).toBeVisible();
});
