import Navbarr from "@/layout/Navbarr";
import "./globals.css";
import { Inter } from "next/font/google";
import ActiveChatContextProvider from "@/context/ActiveChatContext";
import ActiveProfileContextProvider from "@/context/ActiveProfileContext";
import { AuthContextProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          <ActiveProfileContextProvider>
            <ActiveChatContextProvider>
              <div>
                <Navbarr />
              </div>
              {children}
            </ActiveChatContextProvider>
          </ActiveProfileContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
