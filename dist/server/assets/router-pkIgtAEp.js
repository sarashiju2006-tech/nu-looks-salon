import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
const appCss = "/assets/styles-Bw-4uS82.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$1 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$1.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
const g1 = "/assets/g1-Dnmxx3_n.jpg";
const g2 = "/assets/g2-DN-o7apH.jpg";
const g3 = "/assets/g3-C1xvUO0L.jpg";
const g4 = "/assets/g4-Dh9xD3Pu.jpg";
const g5 = "/assets/g5-CBEz_R-F.jpg";
const g6 = "/assets/g6-DwVgwiY3.jpg";
const config = {
  brand: {
    name: "Luxe Studio",
    tagline: "Bespoke hair, crafted in the heart of Bengaluru.",
    location: "Indiranagar, Bengaluru"
  },
  nav: [{
    label: "About",
    href: "#about"
  }, {
    label: "Services",
    href: "#services"
  }, {
    label: "Gallery",
    href: "#gallery"
  }, {
    label: "Contact",
    href: "#contact"
  }],
  about: {
    eyebrow: "About the studio",
    title: "A quieter kind of luxury.",
    body: "Tucked away on a leafy lane in Indiranagar, Luxe Studio is a small team of senior stylists obsessed with healthy hair and honest advice. We take fewer clients a day so every visit feels unhurried — just thoughtful consultation, considered craft, and a cup of chai while you settle in."
  },
  services: [{
    name: "Signature Haircut",
    desc: "Consultation, wash, precision cut and blow-dry.",
    price: "₹500"
  }, {
    name: "Hair Color",
    desc: "Global color using ammonia-free premium brands.",
    price: "₹1,500"
  }, {
    name: "Highlights & Balayage",
    desc: "Hand-painted dimension tailored to your tone.",
    price: "₹3,500"
  }, {
    name: "Keratin Treatment",
    desc: "Frizz-free, salon-smooth finish for up to 5 months.",
    price: "₹4,500"
  }, {
    name: "Hair Spa & Repair",
    desc: "Deep-conditioning ritual for tired, thirsty hair.",
    price: "₹1,200"
  }, {
    name: "Bridal Styling",
    desc: "Trial + on-the-day hair styling for your wedding.",
    price: "₹8,000"
  }],
  gallery: [{
    src: g1,
    alt: "Glossy styled hair",
    h: "row-span-2"
  }, {
    src: g2,
    alt: "Precision haircut"
  }, {
    src: g3,
    alt: "Caramel balayage"
  }, {
    src: g4,
    alt: "Premium salon products",
    h: ""
  }, {
    src: g5,
    alt: "Bridal updo",
    h: "row-span-2"
  }, {
    src: g6,
    alt: "Mens premium haircut"
  }],
  booking: {
    title: "Reserve your chair",
    body: "Pick a time that suits you — confirmation lands in your inbox within minutes.",
    embedUrl: "https://cal.com/sara-ggak17/hair-appointment"
    // drop in Cal.com embed URL here
  },
  contact: {
    address: "238, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560008",
    phone: "+91 9673200967",
    instagram: "@luxestudio.blr",
    instagramUrl: "https://instagram.com",
    mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0241555932125!2d77.63940697460791!3d12.970306087345012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16a7fb45b053%3A0xd5c3780186e8c3!2s12th%20Main%20Rd%2C%20Indiranagar%2C%20Bengaluru%2C%20Karnataka%20560008!5e0!3m2!1sen!2sin!4v1780654927086!5m2!1sen!2sin",
    hours: "Tue – Sun · 10:00 am – 8:00 pm"
  },
  cta: "Book Appointment"
};
const $$splitComponentImporter = () => import("./index-kK7LuiOX.js");
const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: `${config.brand.name} — Hair Salon in Bengaluru`
    }, {
      name: "description",
      content: config.brand.tagline
    }, {
      property: "og:title",
      content: config.brand.name
    }, {
      property: "og:description",
      content: config.brand.tagline
    }, {
      property: "og:type",
      content: "website"
    }, {
      property: "og:url",
      content: "/"
    }],
    links: [{
      rel: "canonical",
      href: "/"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$1
});
const rootRouteChildren = {
  IndexRoute
};
const routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  config as c,
  router as r
};
