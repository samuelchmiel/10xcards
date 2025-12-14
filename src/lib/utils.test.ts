import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (className utility)", () => {
  it("merges multiple class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn("base", isActive && "active", isDisabled && "disabled");
    expect(result).toBe("base active");
  });

  it("handles undefined and null values", () => {
    const result = cn("base", undefined, null, "other");
    expect(result).toBe("base other");
  });

  it("handles empty strings", () => {
    const result = cn("base", "", "other");
    expect(result).toBe("base other");
  });

  it("merges Tailwind classes correctly", () => {
    const result = cn("px-4 py-2", "px-6");
    expect(result).toBe("py-2 px-6");
  });

  it("handles conflicting Tailwind classes", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles arrays of classes", () => {
    const result = cn(["foo", "bar"], "baz");
    expect(result).toBe("foo bar baz");
  });

  it("handles object syntax", () => {
    const result = cn({
      base: true,
      active: true,
      disabled: false,
    });
    expect(result).toBe("base active");
  });

  it("handles mixed inputs", () => {
    const showConditional = true;
    const result = cn(
      "base",
      ["array-class"],
      { "object-class": true, "hidden-class": false },
      showConditional && "conditional"
    );
    expect(result).toBe("base array-class object-class conditional");
  });

  it("returns empty string for no valid classes", () => {
    const result = cn(undefined, null, false);
    expect(result).toBe("");
  });

  it("handles responsive Tailwind classes", () => {
    const result = cn("w-full", "md:w-1/2", "lg:w-1/3");
    expect(result).toBe("w-full md:w-1/2 lg:w-1/3");
  });

  it("handles hover and focus states", () => {
    const result = cn("bg-white", "hover:bg-gray-100", "focus:ring-2");
    expect(result).toBe("bg-white hover:bg-gray-100 focus:ring-2");
  });

  it("passes through exact same non-Tailwind classes", () => {
    // Note: cn uses clsx + twMerge, which doesn't deduplicate non-Tailwind classes
    const result = cn("foo", "foo", "bar");
    expect(result).toBe("foo foo bar");
  });

  it("handles Tailwind spacing conflicts", () => {
    const result = cn("m-2", "m-4");
    expect(result).toBe("m-4");
  });

  it("handles complex component class patterns", () => {
    const variant = "primary" as string;
    const size = "lg" as string;
    const result = cn(
      "btn",
      variant === "primary" && "btn-primary",
      variant === "secondary" && "btn-secondary",
      size === "sm" && "btn-sm",
      size === "lg" && "btn-lg"
    );
    expect(result).toBe("btn btn-primary btn-lg");
  });
});
