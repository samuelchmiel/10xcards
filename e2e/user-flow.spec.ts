import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Test credentials from environment variables
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "";

// Check if real credentials are configured
const hasCredentials = TEST_EMAIL.length > 0 && TEST_PASSWORD.length > 0;

// Helper function to login
async function login(page: Page) {
  await page.goto("/login");
  await page.getByTestId("email-input").fill(TEST_EMAIL);
  await page.getByTestId("password-input").fill(TEST_PASSWORD);
  await page.getByTestId("login-button").click();
  await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  await expect(page.getByTestId("dashboard-content")).toBeVisible();
}

// Helper function to create a deck
async function createDeck(page: Page, name: string, description = "E2E test deck") {
  await page.getByTestId("deck-name-input").fill(name);
  await page.getByTestId("deck-description-input").fill(description);
  await page.getByTestId("create-deck-button").click();
  await expect(page.getByText(name)).toBeVisible({ timeout: 5000 });
}

// Helper function to create a flashcard
async function createFlashcard(page: Page, front: string, back: string) {
  await page.getByTestId("flashcard-front-input").fill(front);
  await page.getByTestId("flashcard-back-input").fill(back);
  await page.getByTestId("create-flashcard-button").click();
  await expect(page.getByText(front)).toBeVisible({ timeout: 5000 });
}

// Helper function to delete a deck
async function deleteDeck(page: Page, deckName: string) {
  const deckItem = page.locator(`[data-testid^="deck-item-"]`).filter({ hasText: deckName });
  await deckItem.hover();
  const deleteButton = deckItem.locator(`[data-testid^="delete-deck-button-"]`);
  await deleteButton.click();
  await expect(page.getByTestId("confirm-delete-deck")).toBeVisible();
  await page.getByTestId("confirm-delete-deck").click();
  await expect(page.getByText(deckName)).not.toBeVisible({ timeout: 5000 });
}

test.describe("User Flow", () => {
  // Skip all tests if credentials aren't configured
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
      await expect(page).toHaveURL("/login");
    });

    test("should redirect unauthenticated users to login", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL("/login");
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

      // Verify updated name appears
      await expect(page.getByText(updatedName)).toBeVisible({ timeout: 5000 });

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

      // Verify flashcard appears
      await expect(page.getByText(originalFront)).toBeVisible();
      await expect(page.getByText(originalBack)).toBeVisible();

      // Edit the flashcard
      const flashcardItem = page.locator(`[data-testid^="flashcard-item-"]`).first();
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
      await expect(page.getByText(updatedFront)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(updatedBack)).toBeVisible();

      // Delete the flashcard
      await flashcardItem.hover();
      const deleteFlashcardBtn = flashcardItem.locator(`[data-testid^="delete-flashcard-button-"]`);
      await deleteFlashcardBtn.click();
      await expect(page.getByTestId("confirm-delete-flashcard")).toBeVisible();
      await page.getByTestId("confirm-delete-flashcard").click();

      // Verify flashcard is removed
      await expect(page.getByText(updatedFront)).not.toBeVisible({ timeout: 5000 });

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

      // Click study button
      await page.getByTestId("study-deck-button").click();

      // Verify study mode loaded
      await expect(page.getByTestId("study-mode")).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId("card-counter")).toHaveText(/Card 1\/2/);

      // Verify front of card is visible
      await expect(page.getByTestId("flashcard-front")).toBeVisible();

      // Click to flip card
      await page.getByTestId("flashcard").click();

      // Navigate to next card
      await page.getByTestId("next-button").click();
      await expect(page.getByTestId("card-counter")).toHaveText(/Card 2\/2/);

      // Verify next button is disabled on last card
      await expect(page.getByTestId("next-button")).toBeDisabled();

      // Navigate back
      await page.getByTestId("previous-button").click();
      await expect(page.getByTestId("card-counter")).toHaveText(/Card 1\/2/);

      // Verify previous button is disabled on first card
      await expect(page.getByTestId("previous-button")).toBeDisabled();

      // Test shuffle button
      await page.getByTestId("shuffle-button").click();
      // After shuffle, reset button should appear
      await expect(page.getByTestId("reset-button")).toBeVisible();

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
      await expect(page.getByTestId("profile-page")).toBeVisible();

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

      // Verify flashcard count in study button
      await expect(page.getByTestId("study-deck-button")).toContainText("Study (3)");

      // Enter study mode
      await page.getByTestId("study-deck-button").click();
      await expect(page.getByTestId("study-mode")).toBeVisible();
      await expect(page.getByTestId("card-counter")).toHaveText(/Card 1\/3/);

      // Study through all cards
      await page.getByTestId("flashcard").click(); // Flip
      await page.getByTestId("next-button").click(); // Next card
      await page.getByTestId("flashcard").click(); // Flip
      await page.getByTestId("next-button").click(); // Next card
      await expect(page.getByTestId("card-counter")).toHaveText(/Card 3\/3/);

      // Exit and return to dashboard
      await page.getByTestId("study-exit-button").click();
      await expect(page).toHaveURL("/dashboard");

      // Cleanup
      await deleteDeck(page, deckName);

      // Logout
      await page.getByTestId("logout-button").click();
      await expect(page).toHaveURL("/login");
    });
  });
});
