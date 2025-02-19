import { StoreProvider } from "@/lib/StoreContext";
import "./globals.css";
import { headers } from "next/headers";

export const metadata = {
  title: "Chat App",
  description: "Chat Application Project",
};

export default async function RootLayout({ children }) {
  const headersData = headers();
  const authUserHeader = headersData.get("x-auth-user");
  let authUser = null;

  if (authUserHeader) {
    try {
      const decodedAuthUser = atob(authUserHeader);
      authUser = JSON.parse(decodedAuthUser);
    } catch (error) {
      console.error("Failed to parse authenticated user:", error);
    }
  }

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Quicksand:wght@400;600&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body>
        {authUser ? (
          <StoreProvider authUser={authUser}>{children}</StoreProvider>
        ) : (
          <div>{children}</div>
        )}
      </body>
    </html>
  );
}
