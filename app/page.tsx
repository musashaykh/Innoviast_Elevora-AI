import { ChatContainer } from "@/components/chat/chat-container";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { CareerCategories, CtaSection, WhyChoose } from "@/components/landing-sections";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <WhyChoose />
        <CareerCategories />
        <ChatContainer />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
