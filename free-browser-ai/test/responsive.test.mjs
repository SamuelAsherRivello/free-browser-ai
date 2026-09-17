import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";
import { createServer } from "vite";

const configFile = fileURLToPath(new URL("../../vite.config.js", import.meta.url));
const storageKey = "free-browser-ai.state.v2";
const modelId = "onnx-community/Qwen2.5-0.5B-Instruct";
const browserTypes = { chromium, webkit };
const selectedBrowserNames = process.env.RESPONSIVE_BROWSER ? [process.env.RESPONSIVE_BROWSER] : Object.keys(browserTypes);
let server;
let appUrl;

function savedState({ activeConversation = true, view = "settings" } = {}) {
  const conversations = activeConversation ? [{
    id: "conversation-1",
    providerModelId: "model-1",
    title: "Chat 1 - TQ2.5",
    status: "idle",
    phase: "",
    startedAt: null,
    error: "",
    retryPrompt: "",
    messages: Array.from({ length: 24 }, (_, index) => ({
      id: `message-${index}`,
      role: index % 2 === 0 ? "user" : "assistant",
      content: `Message ${index + 1}: local responsive test content that makes the transcript taller than the mobile viewport.`,
    })),
  }] : [];
  return {
    catalogVersion: 2,
    providerModels: [{ id: "model-1", provider: "transformers", model: modelId }],
    conversations,
    activeConversationId: conversations[0]?.id ?? null,
    view,
    generationProfiles: {},
  };
}

async function openFixture(browserType, options = {}) {
  const { activeConversation = true, view = "settings", viewport = { width: 390, height: 844 }, mobile = true } = options;
  const browser = await browserType.launch();
  const context = await browser.newContext({ viewport, hasTouch: mobile, isMobile: mobile });
  await context.addInitScript(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: storageKey, state: savedState({ activeConversation, view }) });
  const page = await context.newPage();
  await page.goto(appUrl, { waitUntil: "networkidle" });
  return { browser, page };
}

async function forEachBrowser(t, callback) {
  for (const name of selectedBrowserNames) {
    const browserType = browserTypes[name];
    if (!browserType) throw new Error(`Unknown responsive browser: ${name}`);
    await t.test(name, async () => callback(browserType));
  }
}

before(async () => {
  server = await createServer({ configFile, logLevel: "silent", server: { host: "127.0.0.1", port: 0, strictPort: false } });
  await server.listen();
  const address = server.httpServer.address();
  if (!address || typeof address === "string") throw new Error("Responsive test server did not expose a TCP port.");
  appUrl = `http://127.0.0.1:${address.port}/free-browser-ai/`;
});

after(async () => {
  await server?.close();
});

test("responsive fixture exposes every workspace state without preparing a model", async (t) => {
  await forEachBrowser(t, async (browserType) => {
    const active = await openFixture(browserType);
    try {
      await active.page.getByRole("heading", { name: "Settings", exact: true }).waitFor();
      await active.page.getByRole("button", { name: "About" }).click();
      await active.page.getByRole("heading", { name: "About", exact: true }).waitFor();
      await active.page.getByRole("button", { name: "Chat" }).click();
      await active.page.getByRole("region", { name: "Chat 1 - TQ2.5" }).waitFor();
    } finally {
      await active.browser.close();
    }

    const setup = await openFixture(browserType, { activeConversation: false, view: "chat" });
    try {
      await setup.page.getByText("Add a conversation, then choose a Provider Model.").waitFor();
      await setup.page.getByRole("button", { name: "Add Conversation" }).click();
      await setup.page.getByLabel("Provider Model").waitFor();
    } finally {
      await setup.browser.close();
    }
  });
});

test("mobile informational views keep all required content reachable", async (t) => {
  await forEachBrowser(t, async (browserType) => {
    const fixture = await openFixture(browserType, { viewport: { width: 390, height: 640 } });
    try {
      await fixture.page.locator('[title="Toggle this provider model settings"]').click();
      const settings = await fixture.page.evaluate(() => {
        const root = document.documentElement;
        const list = document.querySelector(".configuration_list");
        const reset = document.querySelector(".reset_button");
        const scroller = document.scrollingElement;
        scroller.scrollLeft = 999;
        const horizontalScrollLeft = scroller.scrollLeft;
        scroller.scrollLeft = 0;
        return {
          documentClientHeight: root.clientHeight,
          documentScrollHeight: root.scrollHeight,
          listClientHeight: list.clientHeight,
          listScrollHeight: list.scrollHeight,
          listOverflowY: getComputedStyle(list).overflowY,
          resetBottom: reset.getBoundingClientRect().bottom,
          horizontalScrollLeft,
        };
      });

      await fixture.page.getByRole("button", { name: "About" }).click();
      const about = await fixture.page.evaluate(() => {
        const root = document.documentElement;
        const panel = document.querySelector(".panel");
        const lastContent = panel.lastElementChild;
        return {
          documentClientHeight: root.clientHeight,
          documentScrollHeight: root.scrollHeight,
          lastContentBottom: lastContent.getBoundingClientRect().bottom,
        };
      });

      assert.ok(settings.documentScrollHeight > settings.documentClientHeight, "Settings must use document scrolling on a short mobile viewport.");
      assert.ok(settings.listClientHeight >= settings.listScrollHeight - 1, "Provider Models must expand instead of becoming a nested collapsed scroll region.");
      assert.equal(settings.listOverflowY, "visible", "Provider Models must not own vertical scrolling on mobile.");
      assert.equal(settings.horizontalScrollLeft, 0, `Settings must not allow horizontal page scrolling: ${JSON.stringify(settings)}`);
      assert.ok(settings.resetBottom <= settings.documentScrollHeight + 1, "Persistence controls must fall within the scrollable document.");
      assert.ok(about.documentScrollHeight > about.documentClientHeight, "About must use document scrolling when its content exceeds the viewport.");
      assert.ok(about.lastContentBottom <= about.documentScrollHeight + 1, "All About content must fall within the scrollable document.");
    } finally {
      await fixture.browser.close();
    }
  });
});

test("mobile active chat keeps transcript scrolling and prompt controls reachable", async (t) => {
  await forEachBrowser(t, async (browserType) => {
    const fixture = await openFixture(browserType, { view: "chat", viewport: { width: 390, height: 640 } });
    try {
      const metrics = await fixture.page.evaluate(() => {
        const root = document.documentElement;
        const transcript = document.querySelector(".transcript");
        const prompt = document.querySelector(".prompt_form");
        return {
          conversationState: document.querySelector(".workspace")?.dataset.conversationState,
          documentClientHeight: root.clientHeight,
          documentScrollHeight: root.scrollHeight,
          transcriptClientHeight: transcript.clientHeight,
          transcriptScrollHeight: transcript.scrollHeight,
          transcriptOverflowY: getComputedStyle(transcript).overflowY,
          promptBottom: prompt.getBoundingClientRect().bottom,
          viewportHeight: innerHeight,
        };
      });
      assert.equal(metrics.conversationState, "active");
      assert.equal(metrics.documentScrollHeight, metrics.documentClientHeight, "Active mobile Chat must retain a viewport-constrained shell.");
      assert.ok(metrics.transcriptScrollHeight > metrics.transcriptClientHeight, "The transcript fixture must overflow vertically.");
      assert.match(metrics.transcriptOverflowY, /auto|scroll/);
      assert.ok(metrics.promptBottom <= metrics.viewportHeight + 1, "Prompt controls must remain inside the visible mobile viewport.");
    } finally {
      await fixture.browser.close();
    }
  });
});

test("touch landscape uses a compact header with accessible primary targets", async (t) => {
  await forEachBrowser(t, async (browserType) => {
    const fixture = await openFixture(browserType, { viewport: { width: 844, height: 390 } });
    try {
      const metrics = await fixture.page.evaluate(() => ({
        headerHeight: document.querySelector(".top_navigation").getBoundingClientRect().height,
        titleVisible: document.querySelector(".corner_title").getBoundingClientRect().width > 0,
        projectLinkVisible: document.querySelector(".workspace_brand a").getBoundingClientRect().width > 0,
        targets: [...document.querySelectorAll(".top_navigation button")].map((button) => button.getBoundingClientRect().toJSON()),
        documentClientWidth: document.documentElement.clientWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
      }));
      assert.ok(metrics.headerHeight <= 60, "Short touch landscape must compact navigation into one row.");
      assert.ok(metrics.titleVisible && metrics.projectLinkVisible, "Compact navigation must retain the title and project link.");
      assert.ok(metrics.targets.every(({ width, height }) => width >= 44 && height >= 44), `Every primary navigation target must be at least 44 by 44 CSS pixels: ${JSON.stringify(metrics.targets)}`);
      assert.ok(metrics.documentScrollWidth <= metrics.documentClientWidth, "Landscape navigation must not create horizontal page overflow.");
    } finally {
      await fixture.browser.close();
    }
  });
});

test("wide viewport preserves the fixed centered workspace", async (t) => {
  await forEachBrowser(t, async (browserType) => {
    const fixture = await openFixture(browserType, { viewport: { width: 1440, height: 900 }, mobile: false });
    try {
      const metrics = await fixture.page.evaluate(() => {
        const root = document.documentElement;
        const selectors = [".top_navigation", ".panel", ".workspace_footer"];
        return {
          documentClientHeight: root.clientHeight,
          documentScrollHeight: root.scrollHeight,
          regions: selectors.map((selector) => document.querySelector(selector).getBoundingClientRect().toJSON()),
          viewportHeight: innerHeight,
        };
      });
      assert.equal(metrics.documentScrollHeight, metrics.documentClientHeight, "Desktop document must remain vertically fixed.");
      assert.ok(metrics.regions.every(({ top, bottom }) => top >= 0 && bottom <= metrics.viewportHeight + 1), "Desktop navigation, panel, and footer must remain within the viewport.");
    } finally {
      await fixture.browser.close();
    }
  });
});

test("view and viewport changes keep the active scroll owner and focus reachable", async (t) => {
  await forEachBrowser(t, async (browserType) => {
    const fixture = await openFixture(browserType, { viewport: { width: 390, height: 640 } });
    try {
      await fixture.page.locator('[title="Toggle this provider model settings"]').click();
      await fixture.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      assert.ok(await fixture.page.evaluate(() => scrollY > 0), "The Settings fixture must begin scrolled away from its heading.");

      await fixture.page.evaluate(() => [...document.querySelectorAll(".top_navigation button")].find((button) => button.textContent === "About").click());
      await fixture.page.getByRole("heading", { name: "About", exact: true }).waitFor();
      assert.equal(await fixture.page.evaluate(() => scrollY), 0, "Changing views must reset document scrolling to the new heading.");

      await fixture.page.getByRole("button", { name: "Settings" }).click();
      const reset = fixture.page.getByRole("button", { name: "Reset local workspace" });
      await fixture.page.getByRole("button", { name: "About" }).focus();
      for (let press = 0; press < 20; press += 1) {
        if (await reset.evaluate((element) => document.activeElement === element)) break;
        await fixture.page.keyboard.press("Tab");
      }
      assert.ok(await reset.evaluate((element) => document.activeElement === element), "Keyboard navigation must reach the Reset control.");
      const focusedControl = await reset.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, viewportHeight: innerHeight };
      });
      assert.ok(focusedControl.top >= 0 && focusedControl.bottom <= focusedControl.viewportHeight, `Keyboard focus must bring the mobile control into view: ${JSON.stringify(focusedControl)}`);

      await fixture.page.setViewportSize({ width: 1440, height: 900 });
      const desktop = await fixture.page.evaluate(() => ({
        documentClientHeight: document.documentElement.clientHeight,
        documentScrollHeight: document.documentElement.scrollHeight,
        headingTop: document.querySelector("#settings-title").getBoundingClientRect().top,
      }));
      assert.equal(desktop.documentScrollHeight, desktop.documentClientHeight, "Resizing to desktop must restore the fixed document shell.");
      assert.ok(desktop.headingTop >= 0, "Desktop resize must not retain a mobile scroll offset that hides the heading.");

      await fixture.page.setViewportSize({ width: 390, height: 640 });
      await fixture.page.getByRole("heading", { name: "Settings", exact: true }).waitFor();
    } finally {
      await fixture.browser.close();
    }
  });
});
