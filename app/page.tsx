import { ChatContainer } from "@/components/chat/chat-container";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ChatContainer />
      </main>
      <Footer />
    </div>
  );
}
