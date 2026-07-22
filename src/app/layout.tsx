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
  title: "ROS2 Mastery — From Zero to Production Robotics",
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
  ],
  authors: [{ name: "ROS2 Mastery" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ROS2 Mastery — From Zero to Production Robotics",
    description:
      "Master ROS2 Humble through a 7-phase strategic roadmap: Nodes, Topics, Services, Actions, TF2, Composition, Lifecycle, URDF, ros2_control, EKF, SLAM, and Nav2.",
    type: "website",
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
