import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ProgressHydration } from "@/components/ProgressProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ros2-mastery.dev"),
  title: {
    default: "ROS2 Mastery — From Zero to Production Robotics",
    template: "%s · ROS2 Mastery",
  },
  description:
    "A modern, interactive 7-phase learning platform that teaches ROS2 Humble from scratch to advanced production-level architecture. Built for robotics engineers, autonomous systems developers, and students.",
  keywords: [
    "ROS2",
    "Humble",
    "robotics",
    "autonomous systems",
    "ROS2 tutorial",
    "robotics middleware",
    "Nav2",
    "SLAM",
    "TF2",
    "ros2_control",
    "URDF",
    "EKF",
    "robot localization",
  ],
  authors: [{ name: "ROS2 Mastery" }],
  creator: "ROS2 Mastery",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
  manifest: undefined,
  openGraph: {
    title: "ROS2 Mastery — From Zero to Production Robotics",
    description:
      "Master ROS2 Humble through a 7-phase strategic roadmap: Nodes, Topics, Services, Actions, TF2, Composition, Lifecycle, URDF, ros2_control, EKF, SLAM, and Nav2.",
    type: "website",
    siteName: "ROS2 Mastery",
    images: [
      {
        url: "/favicon.svg",
        width: 64,
        height: 64,
        alt: "ROS2 Mastery",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ROS2 Mastery — From Zero to Production Robotics",
    description:
      "Master ROS2 Humble through a 7-phase strategic roadmap with interactive code, quizzes, and progress tracking.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ProgressHydration />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
