import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Test credentials from environment variables
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "";

// Check if real credentials are configured
const hasCredentials = TEST_EMAIL.length > 0 && TEST_PASSWORD.length > 0;

// Debug mode for CI troubleshooting
const DEBUG = process.env.DEBUG === "true" || process.env.CI === "true";

function log(message: string) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`[E2E] ${message}`);
  }
}

// Helper function to login with better error handling
async function login(page: Page) {
  log(`Attempting login with email: ${TEST_EMAIL.substring(0, 3)}***`);

  await page.goto("/login");
  const emailInput = page.getByTestId("email-input");
  const passwordInput = page.getByTestId("password-input");
  const loginButton = page.getByTestId("login-button");

  // Wait for form to be ready
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await expect(loginButton).toBeVisible();

  // Fill and verify email - click first to ensure focus
  await emailInput.click();
  await emailInput.fill(TEST_EMAIL);
  await expect(emailInput).toHaveValue(TEST_EMAIL, { timeout: 2000 });

  // Fill and verify password
  await passwordInput.click();
  await passwordInput.fill(TEST_PASSWORD);
  await expect(passwordInput).toHaveValue(TEST_PASSWORD, { timeout: 2000 });

  log("Filled credentials, clicking login button...");
  await loginButton.click();

  // Wait for either success (redirect to dashboard) or error message
  const dashboardUrl = page.waitForURL("**/dashboard", { timeout: 15000 });
  const errorMessage = page
    .getByTestId("auth-message")
    .waitFor({ state: "visible", timeout: 5000 })
    .catch(() => null);

  const result = await Promise.race([
    dashboardUrl.then(() => "success" as const),
    errorMessage.then(() => "error" as const),
  ]).catch(() => "timeout" as const);

  if (result === "error") {
    const authMessage = page.getByTestId("auth-message");
    const messageText = await authMessage.textContent();
    log(`Auth error message: ${messageText}`);

    // Check if it's actually a success message (email confirmation)
    if (messageText?.includes("Check your email")) {
      throw new Error(`Login failed: User needs email confirmation. Message: ${messageText}`);
    }
    throw new Error(`Login failed with error: ${messageText}`);
  }

  if (result === "timeout") {
    const currentUrl = page.url();
    log(`Timeout waiting for redirect. Current URL: ${currentUrl}`);

    // Take screenshot for debugging
    await page.screenshot({ path: "test-results/login-timeout.png" });

    throw new Error(`Login timeout - stayed on ${currentUrl}. Check if credentials are correct and user exists.`);
  }

  log("Login successful, verifying dashboard...");
  await expect(page.getByTestId("dashboard-content")).toBeVisible({ timeout: 10000 });
  log("Dashboard verified");
}

// Helper function to create a deck with better selectors
async function createDeck(page: Page, name: string, description = "E2E test deck") {
  log(`Creating deck: ${name}`);

  const nameInput = page.getByTestId("deck-name-input");
  const descInput = page.getByTestId("deck-description-input");
  const createButton = page.getByTestId("create-deck-button");

  // Wait for form to be ready
  await expect(nameInput).toBeVisible();

  // Fill and verify name
  await nameInput.click();
  await nameInput.fill(name);
  await expect(nameInput).toHaveValue(name, { timeout: 2000 });

  // Fill and verify description
  await descInput.click();
  await descInput.fill(description);
  await expect(descInput).toHaveValue(description, { timeout: 2000 });

  // Wait for button to be enabled (name is filled)
  await expect(createButton).toBeEnabled({ timeout: 5000 });
  await createButton.click();

  // Wait for deck to appear in the list - use more specific selector
  const deckItem = page.locator(`[data-testid^="deck-item-"]`).filter({ hasText: name });
  await expect(deckItem).toBeVisible({ timeout: 5000 });

  // Click to select the deck
  await deckItem.click();

  // Wait for deck header to show the name
  await expect(page.getByRole("heading", { level: 2, name })).toBeVisible({ timeout: 5000 });
  log(`Deck "${name}" created and selected`);
}

// Helper function to create a flashcard
async function createFlashcard(page: Page, front: string, back: string) {
  log(`Creating flashcard: ${front.substring(0, 20)}...`);

  const frontInput = page.getByTestId("flashcard-front-input");
  const backInput = page.getByTestId("flashcard-back-input");
  const createButton = page.getByTestId("create-flashcard-button");

  // Fill and verify front
  await frontInput.click();
  await frontInput.fill(front);
  await expect(frontInput).toHaveValue(front, { timeout: 2000 });

  // Fill and verify back
  await backInput.click();
  await backInput.fill(back);
  await expect(backInput).toHaveValue(back, { timeout: 2000 });

  await expect(createButton).toBeEnabled();
  await createButton.click();

  // Wait for flashcard to appear in list
  const flashcardItem = page.locator(`[data-testid^="flashcard-item-"]`).filter({ hasText: front });
  await expect(flashcardItem).toBeVisible({ timeout: 5000 });
  log("Flashcard created");
}

// Helper function to delete a deck
async function deleteDeck(page: Page, deckName: string) {
  log(`Deleting deck: ${deckName}`);

  const deckItem = page.locator(`[data-testid^="deck-item-"]`).filter({ hasText: deckName });
  await deckItem.hover();
  const deleteButton = deckItem.locator(`[data-testid^="delete-deck-button-"]`);
  await deleteButton.click();
  await expect(page.getByTestId("confirm-delete-deck")).toBeVisible();
  await page.getByTestId("confirm-delete-deck").click();

  // Wait for deck to be removed from list
  await expect(deckItem).not.toBeVisible({ timeout: 5000 });
  log("Deck deleted");
}

test.describe("User Flow", () => {
  // Skip all tests if credentials aren't configured
  test.beforeEach(async () => {
    if (!hasCredentials) {
      log("Skipping test - E2E_TEST_EMAIL and E2E_TEST_PASSWORD not configured");
    }
  });

  test.skip(!hasCredentials, "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set");

  test.describe("Authentication", () => {
    test("should login and logout successfully", async ({ page }) => {
      // Visit landing page
      await page.goto("/");
      await expect(page.getByTestId("landing-login-btn")).toBeVisible();

      // Navigate to login page
      await page.getByTestId("landing-login-btn").click();
      await expect(page).toHaveURL("/login");

      // Log in
      await login(page);

      // Logout
      await page.getByTestId("logout-button").click();
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test("should redirect unauthenticated users to login", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Deck Management", () => {
    test("should create and delete a deck", async ({ page }) => {
      await login(page);

      const deckName = `Test Deck ${Date.now()}`;
      await createDeck(page, deckName);

      // Verify deck is selected
      await expect(page.getByRole("heading", { name: deckName })).toBeVisible();

      // Delete the deck
      await deleteDeck(page, deckName);
    });

    test("should edit a deck name and description", async ({ page }) => {
      await login(page);

      const deckName = `Edit Test ${Date.now()}`;
      const updatedName = `${deckName} Updated`;
      await createDeck(page, deckName, "Original description");

      // Click edit button
      const deckItem = page.locator(`[data-testid^="deck-item-"]`).filter({ hasText: deckName });
      await deckItem.hover();
      const editButton = deckItem.locator(`[data-testid^="edit-deck-button-"]`);
      await editButton.click();

      // Edit the deck
      await expect(page.getByTestId("edit-deck-name")).toBeVisible();
      await page.getByTestId("edit-deck-name").clear();
      await page.getByTestId("edit-deck-name").fill(updatedName);
      await page.getByTestId("edit-deck-description").clear();
      await page.getByTestId("edit-deck-description").fill("Updated description");
      await page.getByTestId("confirm-edit-deck").click();

      // Verify updated name appears in deck list
      const updatedDeckItem = page.locator(`[data-testid^="deck-item-"]`).filter({ hasText: updatedName });
      await expect(updatedDeckItem).toBeVisible({ timeout: 5000 });

      // Cleanup
      await deleteDeck(page, updatedName);
    });
  });

  test.describe("Flashcard Management", () => {
    test("should create, edit, and delete a flashcard", async ({ page }) => {
      await login(page);

      const deckName = `Flashcard Test ${Date.now()}`;
      await createDeck(page, deckName);

      // Create a flashcard
      const originalFront = "What is TypeScript?";
      const originalBack = "A typed superset of JavaScript";
      await createFlashcard(page, originalFront, originalBack);

      // Verify flashcard appears in list
      const flashcardItem = page.locator(`[data-testid^="flashcard-item-"]`).filter({ hasText: originalFront });
      await expect(flashcardItem).toBeVisible();

      // Edit the flashcard
      await flashcardItem.hover();
      const editFlashcardBtn = flashcardItem.locator(`[data-testid^="edit-flashcard-button-"]`);
      await editFlashcardBtn.click();

      // Update flashcard content
      const updatedFront = "What is TypeScript? (Updated)";
      const updatedBack = "A strongly typed programming language";
      await expect(page.getByTestId("edit-flashcard-front")).toBeVisible();
      await page.getByTestId("edit-flashcard-front").clear();
      await page.getByTestId("edit-flashcard-front").fill(updatedFront);
      await page.getByTestId("edit-flashcard-back").clear();
      await page.getByTestId("edit-flashcard-back").fill(updatedBack);
      await page.getByTestId("confirm-edit-flashcard").click();

      // Verify updated content
      const updatedFlashcard = page.locator(`[data-testid^="flashcard-item-"]`).filter({ hasText: updatedFront });
      await expect(updatedFlashcard).toBeVisible({ timeout: 5000 });

      // Delete the flashcard
      await updatedFlashcard.hover();
      const deleteFlashcardBtn = updatedFlashcard.locator(`[data-testid^="delete-flashcard-button-"]`);
      await deleteFlashcardBtn.click();
      await expect(page.getByTestId("confirm-delete-flashcard")).toBeVisible();
      await page.getByTestId("confirm-delete-flashcard").click();

      // Verify flashcard is removed
      await expect(updatedFlashcard).not.toBeVisible({ timeout: 5000 });

      // Cleanup
      await deleteDeck(page, deckName);
    });

    test("should show empty state when no flashcards", async ({ page }) => {
      await login(page);

      const deckName = `Empty Deck ${Date.now()}`;
      await createDeck(page, deckName);

      // Verify empty state message
      await expect(page.getByTestId("flashcard-list-empty")).toBeVisible();
      await expect(page.getByText("No flashcards yet")).toBeVisible();

      // Cleanup
      await deleteDeck(page, deckName);
    });
  });

  test.describe("Study Mode", () => {
    test("should navigate to study mode and interact with flashcards", async ({ page }) => {
      await login(page);

      const deckName = `Study Test ${Date.now()}`;
      await createDeck(page, deckName);

      // Create multiple flashcards
      await createFlashcard(page, "Question 1", "Answer 1");
      await createFlashcard(page, "Question 2", "Answer 2");

      // Reload page to ensure SSR sees the new flashcards
      log("Reloading page to refresh SSR data");
      await page.reload();
      await expect(page.getByTestId("dashboard-content")).toBeVisible({ timeout: 10000 });

      // Re-select the deck after reload
      const deckItem = page.locator(`[data-testid^="deck-item-"]`).filter({ hasText: deckName });
      await deckItem.click();
      await expect(page.getByRole("heading", { level: 2, name: deckName })).toBeVisible({ timeout: 5000 });

      // Click study button (might be "Study All" now with spaced repetition)
      const studyButton = page.getByTestId("study-deck-button");
      await expect(studyButton).toBeEnabled({ timeout: 5000 });

      // Log the study button text to verify flashcard count
      const studyButtonText = await studyButton.textContent();
      log(`Study button text: ${studyButtonText}`);

      log("Clicking study button");
      await studyButton.click();

      // Verify study mode loaded - wait for URL change first
      await expect(page).toHaveURL(/\/study\//, { timeout: 10000 });
      const studyUrl = page.url();
      log(`Navigated to study page: ${studyUrl}`);
      await expect(page.getByTestId("study-mode")).toBeVisible({ timeout: 10000 });

      // Check if we got the no-cards state or the cards state
      const noCardsMsg = page.getByTestId("no-cards-message");
      const cardCounter = page.getByTestId("card-counter");
      const hasNoCardsMsg = await noCardsMsg.isVisible().catch(() => false);
      if (hasNoCardsMsg) {
        log("ERROR: Study mode shows no cards - flashcards may not have been created");
        throw new Error("Study mode shows 'No flashcards' - test data not persisted correctly");
      }
      await expect(cardCounter).toHaveText(/Card 1\/2/, { timeout: 10000 });

      // Verify front of card is visible
      await expect(page.getByTestId("flashcard-front")).toBeVisible();

      // Click to flip card
      await page.getByTestId("flashcard").click();

      // In spaced repetition mode, rating buttons should appear
      // Try to use Next button if available (might be hidden in SR mode when flipped)
      const nextButton = page.getByTestId("next-button");
      if (await nextButton.isVisible()) {
        await nextButton.click();
      } else {
        // Use rating button to advance (Good = 4)
        const goodButton = page.getByTestId("rating-good");
        if (await goodButton.isVisible()) {
          await goodButton.click();
        }
      }

      await expect(page.getByTestId("card-counter")).toHaveText(/Card 2\/2/, { timeout: 10000 });

      // Exit study mode
      await page.getByTestId("study-exit-button").click();
      await expect(page).toHaveURL("/dashboard");

      // Cleanup
      await deleteDeck(page, deckName);
    });

    test("should show disabled study button when deck is empty", async ({ page }) => {
      await login(page);

      const deckName = `Empty Study ${Date.now()}`;
      await createDeck(page, deckName);

      // Study button should be disabled
      await expect(page.getByTestId("study-deck-button")).toBeDisabled();

      // Cleanup
      await deleteDeck(page, deckName);
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to profile page", async ({ page }) => {
      await login(page);

      // Click profile link
      await page.getByTestId("nav-profile").click();
      await expect(page).toHaveURL("/profile");

      // Verify profile page content
      await expect(page.getByTestId("profile")).toBeVisible({ timeout: 10000 });

      // Navigate back to dashboard
      await page.getByTestId("nav-dashboard").click();
      await expect(page).toHaveURL("/dashboard");
    });
  });

  test.describe("Complete User Journey", () => {
    test("full workflow: create deck, add flashcards, study, cleanup", async ({ page }) => {
      await login(page);

      // Create deck
      const deckName = `Journey Test ${Date.now()}`;
      await createDeck(page, deckName, "Complete journey test");

      // Add multiple flashcards
      await createFlashcard(page, "Capital of France?", "Paris");
      await createFlashcard(page, "Capital of Japan?", "Tokyo");
      await createFlashcard(page, "Capital of Brazil?", "Brasilia");

      // Reload page to ensure SSR sees the new flashcards
      log("Reloading page to refresh SSR data");
      await page.reload();
      await expect(page.getByTestId("dashboard-content")).toBeVisible({ timeout: 10000 });

      // Re-select the deck after reload
      const deckItemJourney = page.locator(`[data-testid^="deck-item-"]`).filter({ hasText: deckName });
      await deckItemJourney.click();
      await expect(page.getByRole("heading", { level: 2, name: deckName })).toBeVisible({ timeout: 5000 });

      // Verify flashcard count in study button
      await expect(page.getByTestId("study-deck-button")).toContainText(/Study.*3/);

      // Enter study mode
      log("Clicking study button");
      await page.getByTestId("study-deck-button").click();
      await expect(page).toHaveURL(/\/study\//, { timeout: 10000 });
      log("Navigated to study page");
      await expect(page.getByTestId("study-mode")).toBeVisible({ timeout: 10000 });

      // Check if we got the no-cards state
      const noCardsMsg = page.getByTestId("no-cards-message");
      const hasNoCardsMsg = await noCardsMsg.isVisible().catch(() => false);
      if (hasNoCardsMsg) {
        log("ERROR: Study mode shows no cards - flashcards may not have been created");
        throw new Error("Study mode shows 'No flashcards' - test data not persisted correctly");
      }
      await expect(page.getByTestId("card-counter")).toHaveText(/Card 1\/3/, { timeout: 10000 });

      // Study through cards - flip and advance
      await page.getByTestId("flashcard").click(); // Flip first card

      // Try next button or rating
      const nextButton = page.getByTestId("next-button");
      if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
        await nextButton.click();
      } else {
        const goodButton = page.getByTestId("rating-good");
        if (await goodButton.isVisible()) {
          await goodButton.click();
        }
      }

      // Exit and return to dashboard
      await page.getByTestId("study-exit-button").click();
      await expect(page).toHaveURL("/dashboard");

      // Cleanup
      await deleteDeck(page, deckName);

      // Logout
      await page.getByTestId("logout-button").click();
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});
