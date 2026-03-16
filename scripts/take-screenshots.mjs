#!/usr/bin/env node
import puppeteer from "puppeteer";
import { execSync } from "child_process";
import { setTimeout as sleep } from "timers/promises";

const BASE = "http://localhost:5173/?demo";
const OUT = "docs/screenshots";

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Dashboard list view
  console.log("Capturing list view...");
  await page.goto(BASE, { waitUntil: "networkidle0", timeout: 15000 });
  await sleep(1000); // let animations settle
  await page.screenshot({ path: `${OUT}/dashboard-list.png`, fullPage: true });
  console.log("  saved dashboard-list.png");

  // 2. Kanban view
  console.log("Capturing kanban view...");
  // Click the Kanban button
  const kanbanBtn = await page.evaluateHandle(() => {
    return [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === "Kanban"
    );
  });
  if (kanbanBtn) {
    await kanbanBtn.click();
    await sleep(800);
  }
  await page.screenshot({ path: `${OUT}/dashboard-kanban.png`, fullPage: true });
  console.log("  saved dashboard-kanban.png");

  // 3. Switch back to list view and open task detail panel
  console.log("Capturing task detail...");
  const listBtn = await page.evaluateHandle(() => {
    return [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === "List"
    );
  });
  if (listBtn) {
    await listBtn.click();
    await sleep(500);
  }
  // Click the first task row that has details (t07 - "Implement dark mode toggle")
  const taskRow = await page.evaluateHandle(() => {
    return [...document.querySelectorAll("tr, [style*='cursor: pointer']")].find(
      (el) => el.textContent.includes("Implement dark mode toggle")
    );
  });
  if (taskRow) {
    await taskRow.click();
    await sleep(1000);
  }
  // Screenshot just the viewport (the detail panel is fixed-position)
  await page.screenshot({ path: `${OUT}/task-detail.png` });
  console.log("  saved task-detail.png");

  await browser.close();
  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
