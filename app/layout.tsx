import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"Afterwork — A softer landing after work",description:"A short, low-effort recovery plan to help you leave work behind and come back to yourself.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}