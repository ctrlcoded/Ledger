import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UserProvider, UserProfile } from "@/components/providers/UserProvider";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Lekha — Every rupee, accounted for",
  description:
    "Lekha is a personal finance ledger to track every rupee of income and expense with precision.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  let userProfile: UserProfile | null = null;

  if (session) {
    const [row] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, session.userId));

    // Fallback if the trigger hasn't fired yet or the auth user has no email somehow.
    const { data: authData } = await (await import('@/lib/auth')).createClient().then(c => c.auth.getUser());
    
    if (row) {
      const name = row.displayName || "User";
      const parts = name.split(" ");
      const initials = parts.length > 1 
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
        : name.slice(0, 2).toUpperCase();

      userProfile = {
        id: session.userId,
        name: row.displayName || "",
        email: authData.user?.email || "",
        avatarUrl: row.avatarUrl,
        initials,
        gender: row.gender,
      };
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Set theme before paint to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${instrumentSans.variable} ${robotoMono.variable} font-sans antialiased bg-canvas text-ink`}
      >
        <UserProvider user={userProfile}>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
