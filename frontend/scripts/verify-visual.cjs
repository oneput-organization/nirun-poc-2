const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const output = path.resolve(__dirname, "../test-results/visual");
(async () => {
  const browser = await chromium.launch();
  fs.mkdirSync(output, { recursive: true });
  const scenarios = [
    ["projects", 1],
    ["new-project", 2],
    ["planning", 3],
    ["members", 6],
    ["member-guide", 7],
    ["overview", 8],
    ["audit-partial", 9],
    ["audit-finance", 10],
    ["export", 12],
    ["calendar", 8, "Open the calendar"],
    ["settings", 8, "Settings"],
    ["decision", 8, "Decide now"],
    ["invite-member", 6, "Add member"],
  ];
  const errors = [];
  for (const width of [1440, 390])
    for (const [name, step, action] of scenarios) {
      if (
        width === 390 &&
        ["audit-partial", "audit-finance", "calendar"].includes(name)
      )
        continue;
      for (const variant of ["reference", "next"]) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
        });
        page.on("pageerror", (e) =>
          errors.push({ variant, name, error: e.message }),
        );
        const url =
          variant === "reference"
            ? pathToFileURL(path.resolve(__dirname, "../../Oneput.html")).href
            : process.env.APP_URL || "http://localhost:3000";
        await page.goto(`${url}?guide=how&step=${step}`);
        await page
          .getByRole("button", { name: "Skip", exact: true })
          .last()
          .click();
        if (action) {
          const el =
            action === "Settings"
              ? page.getByTitle("Settings", { exact: true })
              : page.getByRole("button", { name: action, exact: true });
          if (await el.count()) await el.first().click();
        }
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(220);
        await page.screenshot({
          path: `${output}/${width}-${name}-${variant}.png`,
          fullPage: true,
        });
        await page.close();
      }
      console.log(width, name);
    }
  console.log(JSON.stringify({ errors }));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
