import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Matcher AI | Find Your Perfect Job",
  description: "AI-powered job matching platform to find your perfect career match",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        {children}
        <Toaster 
          position="top-right"
          expand={true}
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl",
              description: "group-[.toast]:text-gray-600",
              actionButton: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-blue-600 group-[.toast]:to-blue-700 group-[.toast]:text-white group-[.toast]:font-medium group-[.toast]:rounded-lg group-[.toast]:px-4 group-[.toast]:py-2",
              cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:font-medium group-[.toast]:rounded-lg group-[.toast]:px-4 group-[.toast]:py-2",
              success: "border-l-4 border-l-green-500",
              error: "border-l-4 border-l-red-500",
              warning: "border-l-4 border-l-yellow-500",
              info: "border-l-4 border-l-blue-500",
            },
          }}
        />
      </body>
    </html>
  );
}