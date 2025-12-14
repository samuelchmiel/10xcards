import { test, expect } from "@playwright/test";

// Test credentials from environment variables
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "";

// Check if real credentials are configured
const hasCredentials = TEST_EMAIL.length > 0 && TEST_PASSWORD.length > 0;

test.describe("User Flow", () => {
  // Skip test if credentials aren't configured
  test.skip(!hasCredentials, "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set");

  test("complete user journey: login, create deck, add flashcard, delete deck", async ({ page }) => {
    // 1. Visit landing page
    await page.goto("/");
    await expect(page.getByTestId("landing-login-btn")).toBeVisible();

    // 2. Navigate to login page
    await page.getByTestId("landing-login-btn").click();
    await expect(page).toHaveURL("/login");

    // 3. Log in with test credentials
    await page.getByTestId("email-input").fill(TEST_EMAIL);
    await page.getByTestId("password-input").fill(TEST_PASSWORD);
    await page.getByTestId("login-button").click();

    // 4. Wait for redirect to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
    await expect(page.getByTestId("dashboard-content")).toBeVisible();

    // 5. Create a new deck
    const deckName = `Test Deck ${Date.now()}`;
    await page.getByTestId("deck-name-input").fill(deckName);
    await page.getByTestId("deck-description-input").fill("E2E test deck");
    await page.getByTestId("create-deck-button").click();

    // 6. Verify deck appears in list and is selected
    await expect(page.getByText(deckName)).toBeVisible({ timeout: 5000 });

    // 7. Create a manual flashcard
    await page.getByTestId("flashcard-front-input").fill("What is E2E testing?");
    await page.getByTestId("flashcard-back-input").fill("End-to-end testing that verifies the entire application flow");
    await page.getByTestId("create-flashcard-button").click();

    // 8. Verify flashcard appears in list
    await expect(page.getByText("What is E2E testing?")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("End-to-end testing that verifies the entire application flow")).toBeVisible();

    // 9. Find and delete the deck we created
    const deckItem = page.locator(`[data-testid^="deck-item-"]`).filter({ hasText: deckName });
    await deckItem.hover();
    const deleteButton = deckItem.locator(`[data-testid^="delete-deck-button-"]`);
    await deleteButton.click();

    // 10. Confirm deletion
    await expect(page.getByTestId("confirm-delete-deck")).toBeVisible();
    await page.getByTestId("confirm-delete-deck").click();

    // 11. Verify deck is removed
    await expect(page.getByText(deckName)).not.toBeVisible({ timeout: 5000 });

    // 12. Logout
    await page.getByTestId("logout-button").click();
    await expect(page).toHaveURL("/login");
  });
});
