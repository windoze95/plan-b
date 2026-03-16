#!/usr/bin/env node
import puppeteer from "puppeteer";
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

  // Helper: click a button by its visible text
  async function clickButton(text) {
    const btn = await page.evaluateHandle((t) => {
      return [...document.querySelectorAll("button")].find(
        (b) => b.textContent.replace(/[+−] ?/, "").trim() === t
      );
    }, text);
    if (btn) {
      await btn.click();
      await sleep(300);
    }
  }

  // Clear any persisted localStorage state for clean screenshots
  await page.goto(BASE, { waitUntil: "networkidle0", timeout: 15000 });
  await page.evaluate(() => {
    localStorage.removeItem("plannerdash_filters_collapsed");
    localStorage.removeItem("plannerdash_view");
  });
  await page.reload({ waitUntil: "networkidle0", timeout: 15000 });
  await sleep(1000);

  // 1. Metrics modal
  console.log("Capturing metrics view...");
  await clickButton("Metrics");
  await sleep(800);
  await page.screenshot({ path: `${OUT}/dashboard-metrics.png` });
  console.log("  saved dashboard-metrics.png");
  // Close the modal
  const closeBtn = await page.evaluateHandle(() => {
    return [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === "\u00d7"
    );
  });
  if (closeBtn) {
    await closeBtn.click();
    await sleep(300);
  }

  // 2. Dashboard list view — with filters active
  console.log("Capturing list view...");
  // Include "Active" status
  await clickButton("Active");
  // Include "Feature" tag
  await clickButton("Feature");
  // Exclude "Low" priority (2 clicks: include → exclude)
  await clickButton("Low");
  await clickButton("Low");
  await sleep(500);

  await page.screenshot({ path: `${OUT}/dashboard-list.png`, fullPage: true });
  console.log("  saved dashboard-list.png");

  // 3. Kanban view — clear filters first
  console.log("Capturing kanban view...");
  const clearBtn = await page.evaluateHandle(() => {
    return [...document.querySelectorAll("button")].find(
      (b) => b.textContent.includes("Clear")
    );
  });
  if (clearBtn) {
    await clearBtn.click();
    await sleep(300);
  }
  // Minimize filters for a cleaner kanban shot
  await clickButton("Minimize");
  await sleep(200);
  await clickButton("Kanban");
  await sleep(800);
  await page.screenshot({ path: `${OUT}/dashboard-kanban.png`, fullPage: true });
  console.log("  saved dashboard-kanban.png");

  // 4. Task detail panel
  console.log("Capturing task detail...");
  await clickButton("List");
  await sleep(500);
  const taskRow = await page.evaluateHandle(() => {
    return [...document.querySelectorAll("[style*='cursor: pointer']")].find(
      (el) => el.textContent.includes("Implement dark mode toggle")
    );
  });
  if (taskRow) {
    await taskRow.click();
    await sleep(1000);
  }
  await page.screenshot({ path: `${OUT}/task-detail.png` });
  console.log("  saved task-detail.png");

  await browser.close();
  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
