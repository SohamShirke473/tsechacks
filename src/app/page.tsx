import { HeroSection } from "@/components/landing/HeroSection";
import { InfoSection } from "@/components/landing/InfoSection";
import { CTASection } from "@/components/landing/CTASection";

export default function Page() {
    return (
        <main className="min-h-screen bg-white font-sans">
            <HeroSection />
            <InfoSection />
            <CTASection />
        </main>
    );
}