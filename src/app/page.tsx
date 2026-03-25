import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ChatInterface } from "@/components/chat-interface";
import { MeshGradient } from "@/components/mesh-gradient";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <MeshGradient />
      <Navbar />
      <Hero />
      <ChatInterface />
    </main>
  );
}
