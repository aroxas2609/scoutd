import { LandingDesktop } from "@/components/marketing/landing-desktop";
import { WelcomeScreen } from "@/components/marketing/welcome-screen";

export default function LandingPage() {
  return (
    <>
      <div className="lg:hidden">
        <WelcomeScreen />
      </div>
      <div className="hidden lg:block">
        <LandingDesktop />
      </div>
    </>
  );
}
