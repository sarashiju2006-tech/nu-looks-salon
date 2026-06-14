import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.png";
import g5 from "@/assets/g5.jpg";
import g6 from "@/assets/g6.jpg";
import BookingWidget from '@/components/BookingWidget'

// ============================================================
// SITE CONFIG — swap these to re-skin for any client salon
// ============================================================
const config = {
  brand: {
    name: "Nakshatra Salon",
    tagline: "Premium grooming for men and women, in the heart of Ananth Nagar.",
    location: "Ananth Nagar, Bengaluru",
  },
  nav: [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ],
  about: {
    eyebrow: "About the salon",
    title: "Your neighbourhood salon, elevated.",
    body: "Nakshatra Salon is Ananth Nagar's go-to destination for expert hair and beauty services. Whether you're coming in for a quick trim or a full hair transformation, our experienced team treats every client with care, precision, and premium products.",
  },
  services: [
    { name: "Haircut (Women)", desc: "One-length, advance or creative cut — consultation included.", price: "₹599" },
    { name: "Basic Haircut (Women)", desc: "Clean one-length cut with styling.", price: "₹599" },
    { name: "Advanced Haircut (Women)", desc: "Layered or structured cut with consultation.", price: "₹1,099" },
    { name: "Creative Haircut (Women)", desc: "Custom creative styling cut.", price: "₹1,199" },
    { name: "Haircut (Men)", desc: "Precision cut tailored to your face shape and style.", price: "₹250" },
    { name: "Child Haircut", desc: "Gentle, quick cut for kids — boys and girls.", price: "₹250" },
    { name: "Shave", desc: "Clean razor shave with hot towel finish.", price: "₹150" },
    { name: "Beard Trim", desc: "Sculpted beard trim to your preferred shape.", price: "₹200" },
    { name: "Change of Style", desc: "New look consultation and restyle.", price: "₹350" },
    { name: "Hair Wash + Haircut", desc: "Shampoo, conditioning and precision cut.", price: "₹300" },
    { name: "Hair Fall Treatment", desc: "Targeted scalp treatment to reduce hair fall.", price: "₹999" },
    { name: "Dandruff Treatment", desc: "Deep cleanse treatment for dry or flaky scalp.", price: "₹999" },
    { name: "Schwarzkopf Spa", desc: "Premium conditioning spa using Schwarzkopf products.", price: "₹1,199" },
    { name: "Keratin Hair Spa", desc: "Keratin-infused deep conditioning treatment.", price: "₹999" },
    { name: "3TENX Spa", desc: "Advanced repair spa for damaged or chemically treated hair.", price: "₹1,999" },
    { name: "Herbal Colour", desc: "Natural herbal colour for grey coverage.", price: "₹799" },
    { name: "Schwarzkopf Colour", desc: "Premium ammonia-free global colour.", price: "₹799" },
    { name: "Global Colour", desc: "Full head colour transformation.", price: "₹1,500" },
    { name: "Smoothing", desc: "Long-lasting frizz-free smoothing treatment.", price: "₹2,999" },
    { name: "Straightening", desc: "Permanent straightening for all hair types.", price: "₹2,999" },
    { name: "Keratin Treatment", desc: "Bond-strengthening treatment for smooth, shiny hair.", price: "₹3,000" },
    { name: "Botox", desc: "Hair botox for deep repair and glossy finish.", price: "₹3,499" },
    { name: "Nanoplastia", desc: "Organic smoothing treatment for lasting softness.", price: "₹2,999" },
    { name: "Deep Conditioning", desc: "Intensive moisture treatment for dry hair.", price: "₹399" },
    { name: "Shampoo & Conditioning", desc: "Wash and condition with professional products.", price: "₹499" },
    { name: "Shampoo, Conditioning & Setting", desc: "Full wash, condition and blowdry finish.", price: "₹999" },
    { name: "Hair Spa Schwarzkopf (Women)", desc: "Premium Schwarzkopf spa for women.", price: "₹1,499" },
  ],
  gallery: [
    { src: g1, alt: "Salon interior" },
    { src: g2, alt: "Hair styling", h: "row-span-2" },
    { src: g3, alt: "Men's haircut" },
    { src: g4, alt: "Hair colour" },
    { src: g5, alt: "Hair treatment", h: "row-span-2" },
    { src: g6, alt: "Styling finish" },
  ],
  booking: {
    title: "Reserve your chair",
    body: "Pick a time that suits you. We'll confirm your appointment instantly.",
    embedUrl: "",
  },
  contact: {
    address: "No.182, Hebbagodi 13th Cross, 4th Main Road, 1st Floor, Above Baskin Robbins, Shree Ananth Nagar Layout, Bengaluru 560100",
    phone: "+91 7996622566",
    instagram: "@nakshatrasalon",
    instagramUrl: "https://instagram.com",
    mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.115255663293!2d77.68605447531759!3d12.835828087467156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae6daddf67a7e3%3A0x12e3986cbb29543!2sNakshatra%20Salon%20for%20men%20and%20women!5e0!3m2!1sen!2sin!4v1752900764844!5m2!1sen!2sin",
    hours: "Mon – Sun · 10:00 am – 8:00 pm",
  },
  cta: "Book Appointment",
};

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [visibleCount]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border/60"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:py-5">
          <a href="#top" className="font-display text-xl tracking-wide">
            {config.brand.name}
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {config.nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm text-foreground/80 transition-colors hover:text-accent"
              >
                {n.label}
              </a>
            ))}
            <a
              href="#booking"
              className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Book Now
            </a>
          </nav>
          <button
            aria-label="Toggle menu"
            className="md:hidden flex h-10 w-10 flex-col items-center justify-center gap-1.5"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`block h-px w-6 bg-foreground transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`block h-px w-6 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-6 bg-foreground transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
          </button>
        </div>
        {/* mobile menu */}
        <div
          className={`md:hidden overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur transition-[max-height] duration-300 ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-1 px-5 py-3">
            {config.nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="py-2 text-base text-foreground/80"
              >
                {n.label}
              </a>
            ))}
            <a
              href="#booking"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-primary py-3 text-center text-sm text-primary-foreground"
            >
              Book Now
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section id="top" className="relative min-h-[100svh] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Luxe Studio salon interior"
          width={1536}
          height={1920}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-32 md:justify-center md:pb-24">
          <p className="reveal mb-5 text-xs uppercase tracking-[0.35em] text-accent">
            {config.brand.location}
          </p>
          <h1 className="reveal font-display text-5xl leading-[1.05] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            {config.brand.name}
          </h1>
          <p className="reveal mt-5 max-w-md text-base text-white/85 md:text-lg">
            {config.brand.tagline}
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3">
            <a
              href="#booking"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-accent-foreground transition-transform hover:scale-[1.03]"
            >
              {config.cta}
              <span aria-hidden>→</span>
            </a>
            <a
              href="#services"
              className="inline-flex items-center rounded-full border border-white/40 px-7 py-3.5 text-sm text-white transition-colors hover:bg-white/10"
            >
              View services
            </a>
          </div>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────── */}
      <section id="about" className="px-5 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="reveal mb-4 text-xs uppercase tracking-[0.35em] text-accent">
            {config.about.eyebrow}
          </p>
          <h2 className="reveal font-display text-4xl leading-tight md:text-5xl">
            {config.about.title}
          </h2>
          <p className="reveal mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            {config.about.body}
          </p>
        </div>
      </section>

      {/* ── Services ───────────────────────────────────────── */}
      <section id="services" className="bg-secondary/50 px-5 py-20 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="reveal mb-3 text-xs uppercase tracking-[0.35em] text-accent">Services</p>
              <h2 className="reveal font-display text-4xl md:text-5xl">The menu</h2>
            </div>
            <p className="reveal max-w-sm text-sm text-muted-foreground">
              Transparent pricing. Final quote shared after a quick consultation.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
  {config.services.slice(0, visibleCount).map((s) => (
    <article
      key={s.name}
      className="reveal group rounded-2xl border border-border/60 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-xl">{s.name}</h3>
        <span className="font-display text-lg text-accent">{s.price}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
      <div className="mt-6 h-px w-10 bg-accent/60 transition-all duration-300 group-hover:w-20" />
    </article>
  ))}
</div>

{visibleCount < config.services.length && (
  <div className="mt-10 text-center">
    <button
      onClick={() => setVisibleCount(v => v + 3)}
      className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
    >
      Show more services
      <span aria-hidden>↓</span>
    </button>
  </div>
)}
        </div>
      </section>

      {/* ── Gallery ────────────────────────────────────────── */}
      <section id="gallery" className="px-5 py-20 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="reveal mb-3 text-xs uppercase tracking-[0.35em] text-accent">Gallery</p>
            <h2 className="reveal font-display text-4xl md:text-5xl">Recent work</h2>
          </div>
          <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-3 md:gap-4">
            {config.gallery.map((g, i) => (
              <div
                key={i}
                className={`reveal overflow-hidden rounded-xl bg-muted ${g.h ?? ""}`}
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking ────────────────────────────────────────── */}
      <section id="booking" className="bg-secondary/50 px-5 py-20 md:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="reveal mb-3 text-xs uppercase tracking-[0.35em] text-accent">Booking</p>
            <h2 className="reveal font-display text-4xl md:text-5xl">{config.booking.title}</h2>
            <p className="reveal mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
              {config.booking.body}
            </p>
          </div>
         <div className="reveal overflow-hidden rounded-2xl border border-border bg-card">
  <BookingWidget />
</div>
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────── */}
      <section id="contact" className="px-5 py-20 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="reveal mb-3 text-xs uppercase tracking-[0.35em] text-accent">Visit</p>
            <h2 className="reveal font-display text-4xl md:text-5xl">Come say hello</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 md:gap-10">
            <div className="reveal space-y-7">
              <ContactRow label="Address" value={config.contact.address} />
              <ContactRow
                label="Phone"
                value={
                  <a href={`tel:${config.contact.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                    {config.contact.phone}
                  </a>
                }
              />
              <ContactRow
                label="Instagram"
                value={
                  <a href={config.contact.instagramUrl} className="hover:text-accent" target="_blank" rel="noreferrer">
                    {config.contact.instagram}
                  </a>
                }
              />
              <ContactRow label="Hours" value={config.contact.hours} />
            </div>
            <div className="reveal overflow-hidden rounded-2xl border border-border bg-muted">
              {config.contact.mapsEmbedUrl ? (
                <iframe
                  src={config.contact.mapsEmbedUrl}
                  title="Map"
                  className="h-full min-h-[320px] w-full"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 text-accent">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                  </div>
                  <p className="font-display text-xl">Google Maps embed</p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Add a Maps embed URL to <code className="rounded bg-background px-1.5 py-0.5">config.contact.mapsEmbedUrl</code>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-primary px-5 py-10 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-display text-lg">{config.brand.name}</p>
          <p className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} {config.brand.name}. Crafted with care in Bengaluru.
          </p>
        </div>
      </footer>

    {/* ── Floating buttons ──────────────────────── */}
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      {/* Call button */}
      
        <a href={`tel:${config.contact.phone.replace(/\s/g, "")}`}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black shadow-lg transition-transform hover:scale-110"
        aria-label="Call us"
      >
        <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
      </a>

      {/* WhatsApp button */}
      
        <a href={`https://wa.me/${config.contact.phone.replace(/\D/g, "")}`}
        target="_blank"
        rel="noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.523 5.847L.057 23.428a.75.75 0 0 0 .921.921l5.581-1.466A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.726 9.726 0 0 1-4.953-1.355l-.355-.211-3.664.963.963-3.664-.211-.355A9.726 9.726 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
      </a>
    </div>
    </div>

  ); 
}

function ContactRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-base leading-relaxed md:text-lg">{value}</p>
    </div>
  );
}
