import { test, expect } from "@playwright/test";

test("should sign in successfully with valid credentials", async ({ page }) => {
  await page.goto("https://my-photo-album.pl/signin");

  await page.fill("#email", "test1234@gmail.com");
  await page.fill("#password", "test1234");

  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for navigation to complete
  await page.waitForURL("https://my-photo-album.pl/", { timeout: 10000 });

  expect(page.url()).toBe("https://my-photo-album.pl/");
});
