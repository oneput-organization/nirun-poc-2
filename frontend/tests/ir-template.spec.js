const { test, expect } = require("@playwright/test");

test("IR chapter moves from FP setup through owner draft and seven checks", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await page.getByRole("button", { name: "Look around on my own", exact: true }).click();
  await page.getByRole("button", { name: "Admin", exact: true }).click();
  await page.getByText("ONEPUT FY2025 Annual Report", { exact: true }).first().click();
  await page.getByRole("button", { name: "IR Content Template", exact: true }).click();
  const screen = page.locator('[data-screen-label="IR Content Template"]');
  await expect(screen).toBeVisible();
  await expect(screen.getByRole("heading", { name: "PM setup and finalized structure" })).toBeVisible();

  await screen.getByRole("button", { name: "Open point" }).first().click();
  await expect(page.locator('[data-screen-label="Data point"]')).toBeVisible();
  await page.getByRole("button", { name: "Open this chapter in IR Content Template" }).click();
  await expect(screen).toBeVisible();

  const setup = screen.getByRole("heading", { name: "PM setup and finalized structure" }).locator("xpath=ancestor::section[1]");
  const setupChecks = setup.getByRole("checkbox");
  await expect(setupChecks).toHaveCount(5);
  for (let index = 0; index < 5; index++) await setupChecks.nth(index).check();

  await screen.getByLabel("ESG content owner").fill("ESG content owner");
  await screen.getByLabel("Content due date").fill("2026-10-15");
  await screen.getByRole("button", { name: "Save template" }).click();
  await screen.getByRole("button", { name: "FP: send to content owner" }).click();
  await expect(screen.getByText("Owner drafting", { exact: true })).toBeVisible();
  await screen.getByRole("button", { name: "Queue owner reminder (mock)" }).click();
  await expect(screen.getByText("Owner reminder queued (mock)")).toBeVisible();

  await screen.getByLabel("Performance", { exact: true }).fill("FY2025 performance, verified against the linked data points.");
  await screen.getByRole("button", { name: "Save draft" }).click();
  await screen.getByRole("button", { name: "Owner: submit first draft" }).click();
  await expect(screen.getByText("Submitted for review", { exact: true })).toBeVisible();

  const review = screen.getByRole("heading", { name: "First-draft review" }).locator("xpath=ancestor::section[1]");
  const reviewChecks = review.getByRole("checkbox");
  await expect(reviewChecks).toHaveCount(7);
  for (let index = 0; index < 7; index++) await reviewChecks.nth(index).check();
  await screen.getByRole("button", { name: "FP: send for VP endorsement" }).click();
  await expect(screen.getByText("To VP endorsement", { exact: true })).toBeVisible();

  await page.reload();
  await expect(screen.getByText("To VP endorsement", { exact: true })).toBeVisible();
  await expect(screen.getByRole("textbox", { name: "Performance", exact: true })).toHaveValue("FY2025 performance, verified against the linked data points.");
  expect(errors).toEqual([]);
});
