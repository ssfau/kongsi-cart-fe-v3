import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import farmHero from "@/assets/farm-hero.jpg";
import groceriesHero from "@/assets/groceries-hero.png";
import sdg2 from "@/assets/sdg2.png";
import sdg12 from "@/assets/sdg12.png";
import { ShoppingCart, Users, Leaf } from "lucide-react";

const gradientBtn =
  "bg-gradient-to-r from-kongsi-green to-kongsi-orange text-white font-semibold shadow-lg hover:opacity-90 transition-opacity";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Kongsi Kart" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-xl font-bold tracking-tight">Kongsi Kart</span>
          </div>

          <nav className="hidden gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Platform</a>
            <a href="#trust" className="hover:text-foreground transition-colors">Resources</a>
            <a href="#features" className="hover:text-foreground transition-colors">Customers</a>
            <a href="#trust" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>

          <Link to="/login">
            <Button className={`${gradientBtn} rounded-full px-6`}>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Kongsi the Cart, Kongsi the Cost:
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
            Lowers food prices, making fresh produce more affordable for more households.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className={`${gradientBtn} rounded-full px-8 text-base h-12`}>
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" className={`${gradientBtn} rounded-full px-8 text-base h-12`}>
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section id="trust" className="border-y border-border/40 bg-muted/50 py-10">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Built With
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 text-muted-foreground/60">
            {["MongoDB Atlas", "Claude", "Lovable", "Node.js", "Express", "Fullstack Alchemist"].map(
              (name) => (
                <span key={name} className="text-sm font-semibold tracking-wide whitespace-nowrap">
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Feature Section ── */}
      <section
        id="features"
        className="relative py-24 md:py-32"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={groceriesHero}
            alt="Fresh groceries and produce"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <h2 className="mb-16 text-center font-serif text-3xl font-bold text-white md:text-4xl">
            How Kongsi Kart Works
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl border border-white/20 bg-white/15 p-8 backdrop-blur-xl shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-kongsi-green to-kongsi-green-dark text-white">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Eliminate the Middleman</h3>
              <p className="text-sm leading-relaxed text-white/80">
                Let neighbourhoods pool their demand and purchase fresh produce and bulk goods DIRECTLY
                from suppliers and distributors. Goodbye additional retailer costs!
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-white/20 bg-white/15 p-8 backdrop-blur-xl shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-kongsi-orange to-kongsi-orange-dark text-white">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">The Business Logic</h3>
              <p className="text-sm leading-relaxed text-white/80">
                Seller sets a deposit price. This is paid upfront and if enough people join; it's all
                you pay! Not enough people? Full refund and orders cancelled. MORE people equals LOWER
                price.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-white/20 bg-white/15 p-8 backdrop-blur-xl shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-kongsi-green to-kongsi-orange text-white">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">SDG Goals</h3>
              <div className="flex items-center gap-4">
                <img src={sdg2} alt="SDG 2 - Zero Hunger" className="h-20 w-20 rounded-lg object-cover" />
                <img src={sdg12} alt="SDG 12 - Responsible Consumption and Production" className="h-20 w-20 rounded-lg object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-background py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Kongsi Kart — Community Group-Buying for Malaysia
      </footer>
    </div>
  );
};

export default LandingPage;
