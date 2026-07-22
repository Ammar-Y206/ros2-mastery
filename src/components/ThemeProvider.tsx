"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * ThemeProvider — wraps next-themes with sensible defaults for the ROS2
 * Mastery platform. Defaults to "dark" (the primary design), persists to
 * localStorage under the key "ros2-mastery-theme", and disables the
 * flash-of-incorrect-theme by injecting an inline script.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="ros2-mastery-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
