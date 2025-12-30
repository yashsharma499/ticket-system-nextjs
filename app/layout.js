
import "./globals.css";
import NavBar from "./components/NavBar";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Ticket System",
  description: "Helpdesk Ticket Support Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="text-white h-full overflow-x-hidden">

        <NavBar />

        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 2500,
            style: { background:"#111", color:"#fff", border:"1px solid #333" },
          }}
        />

        {/* no background, no padding so home page fills fully */}
        <main className="min-h-screen p-0 m-0">
          {children}
        </main>

      </body>
    </html>
  );
}
