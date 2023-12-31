import Navbarr from "@/layout/Navbarr";
import "./globals.css";
import { Inter } from "next/font/google";
import ActiveChatContextProvider from "@/context/ActiveChatContext";
import { AuthContextProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chaty Pal",
  description: "A realtime chat app created by Larry Kingstone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          <ActiveChatContextProvider>
            <div>
              <Navbarr />
            </div>
            {children}
          </ActiveChatContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
