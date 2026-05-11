import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Funcionalidades from "@/components/Funcionalidades";
import Beneficios from "@/components/Beneficios";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <Funcionalidades />
      <Beneficios />
      <FAQ />
      <Footer />
    </main>
  );
}