import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { PageTransition } from "@/components/ui/motion";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition className="flex-1 pt-16 md:pt-28">
        <main>{children}</main>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default Layout;
