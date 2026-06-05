import { jsxs, jsx } from "react/jsx-runtime";
import { c as config } from "./router-pkIgtAEp.js";
import { useState, useEffect } from "react";
import "@tanstack/react-query";
import "@tanstack/react-router";
const heroImg = "/assets/hero-DugogsVo.jpg";
function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && window.Cal) {
      window.Cal("init", "hair-appointment", {
        origin: "https://app.cal.com"
      });
      window.Cal.ns["hair-appointment"]("ui", {
        hideEventTypeDetails: false,
        layout: "month_view"
      });
    }
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.12
    });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxs("header", { className: `fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/85 backdrop-blur-md border-b border-border/60" : "bg-transparent"}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:py-5", children: [
        /* @__PURE__ */ jsx("a", { href: "#top", className: "font-display text-xl tracking-wide", children: config.brand.name }),
        /* @__PURE__ */ jsxs("nav", { className: "hidden items-center gap-8 md:flex", children: [
          config.nav.map((n) => /* @__PURE__ */ jsx("a", { href: n.href, className: "text-sm text-foreground/80 transition-colors hover:text-accent", children: n.label }, n.href)),
          /* @__PURE__ */ jsx("a", { href: "#booking", className: "rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-transform hover:scale-[1.03]", children: "Book Now" })
        ] }),
        /* @__PURE__ */ jsxs("button", { "aria-label": "Toggle menu", className: "md:hidden flex h-10 w-10 flex-col items-center justify-center gap-1.5", onClick: () => setOpen((v) => !v), children: [
          /* @__PURE__ */ jsx("span", { className: `block h-px w-6 bg-foreground transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}` }),
          /* @__PURE__ */ jsx("span", { className: `block h-px w-6 bg-foreground transition-opacity ${open ? "opacity-0" : ""}` }),
          /* @__PURE__ */ jsx("span", { className: `block h-px w-6 bg-foreground transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}` })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `md:hidden overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur transition-[max-height] duration-300 ${open ? "max-h-96" : "max-h-0"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 px-5 py-3", children: [
        config.nav.map((n) => /* @__PURE__ */ jsx("a", { href: n.href, onClick: () => setOpen(false), className: "py-2 text-base text-foreground/80", children: n.label }, n.href)),
        /* @__PURE__ */ jsx("a", { href: "#booking", onClick: () => setOpen(false), className: "mt-2 rounded-full bg-primary py-3 text-center text-sm text-primary-foreground", children: "Book Now" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "top", className: "relative min-h-[100svh] w-full overflow-hidden", children: [
      /* @__PURE__ */ jsx("img", { src: heroImg, alt: "Luxe Studio salon interior", width: 1536, height: 1920, className: "absolute inset-0 h-full w-full object-cover" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-32 md:justify-center md:pb-24", children: [
        /* @__PURE__ */ jsx("p", { className: "reveal mb-5 text-xs uppercase tracking-[0.35em] text-accent", children: config.brand.location }),
        /* @__PURE__ */ jsx("h1", { className: "reveal font-display text-5xl leading-[1.05] text-white sm:text-6xl md:text-7xl lg:text-8xl", children: config.brand.name }),
        /* @__PURE__ */ jsx("p", { className: "reveal mt-5 max-w-md text-base text-white/85 md:text-lg", children: config.brand.tagline }),
        /* @__PURE__ */ jsxs("div", { className: "reveal mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxs("a", { href: "#booking", className: "inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-accent-foreground transition-transform hover:scale-[1.03]", children: [
            config.cta,
            /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "→" })
          ] }),
          /* @__PURE__ */ jsx("a", { href: "#services", className: "inline-flex items-center rounded-full border border-white/40 px-7 py-3.5 text-sm text-white transition-colors hover:bg-white/10", children: "View services" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { id: "about", className: "px-5 py-20 md:py-32", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "reveal mb-4 text-xs uppercase tracking-[0.35em] text-accent", children: config.about.eyebrow }),
      /* @__PURE__ */ jsx("h2", { className: "reveal font-display text-4xl leading-tight md:text-5xl", children: config.about.title }),
      /* @__PURE__ */ jsx("p", { className: "reveal mt-6 text-base leading-relaxed text-muted-foreground md:text-lg", children: config.about.body })
    ] }) }),
    /* @__PURE__ */ jsx("section", { id: "services", className: "bg-secondary/50 px-5 py-20 md:py-32", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "reveal mb-3 text-xs uppercase tracking-[0.35em] text-accent", children: "Services" }),
          /* @__PURE__ */ jsx("h2", { className: "reveal font-display text-4xl md:text-5xl", children: "The menu" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "reveal max-w-sm text-sm text-muted-foreground", children: "Transparent pricing. Final quote shared after a quick consultation." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3", children: config.services.map((s) => /* @__PURE__ */ jsxs("article", { className: "reveal group rounded-2xl border border-border/60 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-display text-xl", children: s.name }),
          /* @__PURE__ */ jsx("span", { className: "font-display text-lg text-accent", children: s.price })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-muted-foreground", children: s.desc }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 h-px w-10 bg-accent/60 transition-all duration-300 group-hover:w-20" })
      ] }, s.name)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { id: "gallery", className: "px-5 py-20 md:py-32", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-12 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "reveal mb-3 text-xs uppercase tracking-[0.35em] text-accent", children: "Gallery" }),
        /* @__PURE__ */ jsx("h2", { className: "reveal font-display text-4xl md:text-5xl", children: "Recent work" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-3 md:gap-4", children: config.gallery.map((g, i) => /* @__PURE__ */ jsx("div", { className: `reveal overflow-hidden rounded-xl bg-muted ${g.h ?? ""}`, children: /* @__PURE__ */ jsx("img", { src: g.src, alt: g.alt, loading: "lazy", className: "h-full w-full object-cover transition-transform duration-700 hover:scale-105" }) }, i)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { id: "booking", className: "bg-secondary/50 px-5 py-20 md:py-32", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-4xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-10 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "reveal mb-3 text-xs uppercase tracking-[0.35em] text-accent", children: "Booking" }),
        /* @__PURE__ */ jsx("h2", { className: "reveal font-display text-4xl md:text-5xl", children: config.booking.title }),
        /* @__PURE__ */ jsx("p", { className: "reveal mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base", children: config.booking.body })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "reveal overflow-hidden rounded-2xl border border-border bg-card", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("iframe", { src: config.booking.embedUrl, title: "Booking", className: "h-[640px] w-full" }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 h-20 bg-card" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { id: "contact", className: "px-5 py-20 md:py-32", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-12 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "reveal mb-3 text-xs uppercase tracking-[0.35em] text-accent", children: "Visit" }),
        /* @__PURE__ */ jsx("h2", { className: "reveal font-display text-4xl md:text-5xl", children: "Come say hello" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-8 md:grid-cols-2 md:gap-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "reveal space-y-7", children: [
          /* @__PURE__ */ jsx(ContactRow, { label: "Address", value: config.contact.address }),
          /* @__PURE__ */ jsx(ContactRow, { label: "Phone", value: /* @__PURE__ */ jsx("a", { href: `tel:${config.contact.phone.replace(/\s/g, "")}`, className: "hover:text-accent", children: config.contact.phone }) }),
          /* @__PURE__ */ jsx(ContactRow, { label: "Instagram", value: /* @__PURE__ */ jsx("a", { href: config.contact.instagramUrl, className: "hover:text-accent", target: "_blank", rel: "noreferrer", children: config.contact.instagram }) }),
          /* @__PURE__ */ jsx(ContactRow, { label: "Hours", value: config.contact.hours })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "reveal overflow-hidden rounded-2xl border border-border bg-muted", children: /* @__PURE__ */ jsx("iframe", { src: config.contact.mapsEmbedUrl, title: "Map", className: "h-full min-h-[320px] w-full", loading: "lazy" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-primary px-5 py-10 text-primary-foreground", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row", children: [
      /* @__PURE__ */ jsx("p", { className: "font-display text-lg", children: config.brand.name }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-primary-foreground/60", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ",
        config.brand.name,
        ". Crafted with care in Bengaluru."
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("a", { href: `https://wa.me/${config.contact.phone.replace(/\D/g, "")}`, target: "_blank", rel: "noreferrer", className: "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110", "aria-label": "Chat on WhatsApp", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "white", width: "28", height: "28", children: [
      /* @__PURE__ */ jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" }),
      /* @__PURE__ */ jsx("path", { d: "M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.523 5.847L.057 23.428a.75.75 0 0 0 .921.921l5.581-1.466A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.726 9.726 0 0 1-4.953-1.355l-.355-.211-3.664.963.963-3.664-.211-.355A9.726 9.726 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" })
    ] }) })
  ] });
}
function ContactRow({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.25em] text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-base leading-relaxed md:text-lg", children: value })
  ] });
}
export {
  Index as component
};
