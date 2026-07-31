import { useState, useEffect } from "react";
import { MapPin, ChevronRight, ChevronLeft, Phone, Clock } from "lucide-react";

const HERO_IMGS = [
  {
    url: "https://images.unsplash.com/photo-1692455067486-d4637182a61c?w=1200&h=800&fit=crop&auto=format",
    alt: "Recámara con cama y ventilador de techo",
  },
  {
    url: "https://images.unsplash.com/photo-1644955052489-10bda5c94b19?w=1200&h=800&fit=crop&auto=format",
    alt: "Recámara amplia con cama grande y balcón",
  },
  {
    url: "https://images.unsplash.com/photo-1663337049364-5c6ba8ba1e78?w=1200&h=800&fit=crop&auto=format",
    alt: "Recámara con cama y lámpara de noche",
  },
  {
    url: "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=1200&h=800&fit=crop&auto=format",
    alt: "Cama gris en recámara limpia",
  },
];

// Coordinates rather than a text query, so the pin is deterministic.
// TODO: swap for the Google Business Profile share link once the listing is
// claimed — a real place ID beats raw coordinates for directions.
const LAT_LNG = "32.6179382,-115.5212309";
const MAPS_URL = `https://maps.google.com/?q=${LAT_LNG}`;
const MAPS_EMBED = `https://maps.google.com/maps?q=${LAT_LNG}&output=embed&z=17`;

// Parallel to content[lang].nav, same idiom as CARD_IMGS below.
const NAV_HREFS = ["#inicio", "#catalogo", "#ubicacion"];

// TODO: "Acerca de nosotros" and "Políticas de Garantía" still have no pages
// to point at — they stay dead until those pages exist.
const FOOTER_HREFS = ["#", "#", MAPS_URL];

const CARD_IMGS = [
  "https://images.unsplash.com/photo-1601276174812-63280a55656e?w=700&h=480&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1639690222869-1e608aa51f82?w=700&h=480&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1505692433770-36f19f51681d?w=700&h=480&fit=crop&auto=format",
];

type Lang = "es" | "en";

const content = {
  es: {
    nav: ["Inicio", "Catálogo", "Ubicación"],
    heroHeadline: "Colchones y bases en Mexicali para toda la familia.",
    heroSub: "Visítanos en Mexicali: Colchones, bases y más para tu hogar.",
    heroBtn: "Ver Catálogo",
    gridTitle: "Lo más buscado para tu recámara.",
    cards: [
      { title: "Memory Foam Ortopédico", sub: "Soporte Superior" },
      { title: "Colchón Pillow Top", sub: "Confort Suave" },
      { title: "Base de Cama", sub: "Resistente y Duradera" },
    ],
    contactTitle: "Visítanos y Contáctanos.",
    locationCaption: "Encuéntranos fácilmente — Local 16, Río Sena, Col. Virreyes.",
    locationText: "Local 16, Río Sena, Col. Virreyes, C.P. 21190, Mexicali, B.C.",
    hoursLabel: "Horario",
    hoursText: "Lunes a domingo, 9:00 a 16:00 h",
    hoursClosed: "Miércoles cerrado",
    mapsLink: "Abrir en Google Maps",
    ctaLabel: "Atención directa, sin rodeos.",
    whatsappBtn: "Escríbenos por WhatsApp",
    phone: "+52 686 352 9089",
    footerLinks: ["Acerca de nosotros", "Políticas de Garantía", "Google Maps"],
    footerCopy: "© 2026 Colchones Segunda Itzel. Todos los derechos reservados.",
  },
  en: {
    nav: ["Home", "Catalog", "Location"],
    heroHeadline: "Mattresses and bases in Mexicali for the whole family.",
    heroSub: "Visit us in Mexicali: Mattresses, bases and more for your home.",
    heroBtn: "View Catalog",
    gridTitle: "Our most popular bedroom pieces.",
    cards: [
      { title: "Orthopedic Memory Foam", sub: "Superior Support" },
      { title: "Pillow Top Mattress", sub: "Soft Comfort" },
      { title: "Bed Base", sub: "Sturdy & Durable" },
    ],
    contactTitle: "Come Visit Us.",
    locationCaption: "Find us easily — Local 16, Río Sena, Col. Virreyes.",
    locationText: "Local 16, Río Sena, Col. Virreyes, C.P. 21190, Mexicali, B.C.",
    hoursLabel: "Hours",
    hoursText: "Monday to Sunday, 9:00 AM – 4:00 PM",
    hoursClosed: "Closed Wednesdays",
    mapsLink: "Open in Google Maps",
    ctaLabel: "Direct help, no runaround.",
    whatsappBtn: "Message us on WhatsApp",
    phone: "+52 686 352 9089",
    footerLinks: ["About Us", "Warranty Policies", "Google Maps"],
    footerCopy: "© 2026 Colchones Segunda Itzel. All rights reserved.",
  },
} satisfies Record<Lang, object>;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>("es");
  const t = content[lang];
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_IMGS.length), 4500);
    return () => clearInterval(id);
  }, []);

  // Keep <html lang> honest when the visitor flips the toggle; index.html ships es-MX.
  useEffect(() => {
    document.documentElement.lang = lang === "es" ? "es-MX" : "en";
  }, [lang]);

  const prev = () => setSlide((s) => (s - 1 + HERO_IMGS.length) % HERO_IMGS.length);
  const next = () => setSlide((s) => (s + 1) % HERO_IMGS.length);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">

      {/* ─── HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background border-b-2 border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">

          <a href="#" className="flex items-baseline gap-2" aria-label="Colchones Segunda Itzel">
            <span className="font-display text-xl sm:text-2xl font-bold text-primary leading-none">
              Colchones
            </span>
            {/*
              #925720 instead of the --accent token (#D4843A): the token reads
              2.7:1 on --background and 2.5:1 on secondary/50, well under the
              4.5:1 AA minimum. This is the nearest darker shade of the same
              hue that clears it (5.4:1 here, 4.9:1 on the palest surface it
              lands on). Same substitution on the hero badge and the "cerrado"
              line below. It cannot live in theme.css — that file is not ours
              to edit on this pass.
            */}
            <span className="font-display text-lg sm:text-xl font-semibold text-[#925720] leading-none">
              Segunda Itzel
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
            {(t as typeof content["es"]).nav.map((item, i) => (
              <a key={item} href={NAV_HREFS[i]} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </nav>

          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            aria-label="Cambiar idioma / Switch language"
            className="flex items-center gap-1 text-sm border-2 border-border rounded-sm px-2.5 py-1 hover:bg-muted transition-colors font-semibold"
          >
            <span className={lang === "es" ? "text-primary" : "text-muted-foreground"}>ES</span>
            <span className="text-muted-foreground">/</span>
            <span className={lang === "en" ? "text-primary" : "text-muted-foreground"}>EN</span>
          </button>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section id="inicio" className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-12 grid md:grid-cols-[1fr_1fr] gap-8 items-center">

        <div className="flex flex-col gap-5">
          <span className="self-start bg-[#925720] text-accent-foreground text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
            📍 Mexicali, B.C.
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary leading-tight">
            {(t as typeof content["es"]).heroHeadline}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-[38ch]">
            {(t as typeof content["es"]).heroSub}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#catalogo"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-bold rounded-sm hover:opacity-90 transition-opacity"
            >
              {(t as typeof content["es"]).heroBtn}
              <ChevronRight className="w-4 h-4" />
            </a>
            {/*
              White on WhatsApp brand green (#25D366) is only 2.0:1 — the worst
              contrast failure on the page. Deepened to #188640, the lightest
              green of that hue that reaches 4.5:1 against white (4.6:1), with
              the hover shade darkened proportionally. Still unmistakably the
              WhatsApp button; the alternative was dark text on brand green,
              which changes the button's look far more.
            */}
            <a
              href="https://wa.me/526863529089"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#188640] text-white px-6 py-3 text-sm font-bold rounded-sm hover:bg-[#157538] transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="relative h-64 sm:h-[340px] md:h-[400px] overflow-hidden bg-muted rounded-sm group border-2 border-border">
          {HERO_IMGS.map((img, i) => (
            <img
              key={img.url}
              src={img.url}
              alt={img.alt}
              width={1200}
              height={800}
              // The first slide is the LCP element; the rest can wait.
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <button onClick={prev} aria-label="Anterior" className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/80 hover:bg-background flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-4 h-4 text-primary" />
          </button>
          <button onClick={next} aria-label="Siguiente" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/80 hover:bg-background flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {HERO_IMGS.map((_, i) => (
              // Dots have no text, so they had no accessible name at all.
              // Labelled in Spanish to match "Anterior"/"Siguiente" above.
              <button key={i} onClick={() => setSlide(i)} aria-label={`Ver imagen ${i + 1}`} aria-current={i === slide} className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-5 bg-primary" : "w-1.5 bg-white/60"}`} />
            ))}
          </div>
        </div>
      </section>

      <div className="border-t-2 border-border" />

      {/* ─── PRODUCT GRID ────────────────────────────────────── */}
      <section id="catalogo" className="py-10 md:py-14 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-8">
            {(t as typeof content["es"]).gridTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(t as typeof content["es"]).cards.map((card, i) => (
              <article key={i} className="group flex flex-col bg-card border-2 border-border rounded-sm overflow-hidden hover:border-primary/40 transition-colors">
                <div className="h-48 sm:h-52 overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={CARD_IMGS[i]}
                    alt={`${card.title} — ${card.sub}`}
                    width={700}
                    height={480}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <h3 className="font-display text-base font-bold text-primary leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{card.sub}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t-2 border-border" />

      {/* ─── CONTACT & LOCATION ──────────────────────────────── */}
      <section id="ubicacion" className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-8">
            {(t as typeof content["es"]).contactTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            <div className="flex flex-col gap-2">
              <div className="aspect-[4/3] border-2 border-border rounded-sm overflow-hidden bg-muted">
                <iframe
                  title="Ubicación Local 16 Río Sena Mexicali"
                  src={MAPS_EMBED}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="text-xs text-muted-foreground italic">
                {(t as typeof content["es"]).locationCaption}
              </p>
            </div>

            <div className="bg-secondary/50 border-2 border-border rounded-sm p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="font-bold text-foreground text-sm">Dirección</p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                    {(t as typeof content["es"]).locationText}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="font-bold text-foreground text-sm">Teléfono</p>
                  <a
                    href="tel:+526863529089"
                    className="text-sm text-muted-foreground mt-0.5 hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    {(t as typeof content["es"]).phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="font-bold text-foreground text-sm">
                    {(t as typeof content["es"]).hoursLabel}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                    {(t as typeof content["es"]).hoursText}
                  </p>
                  <p className="text-sm text-[#925720] font-semibold mt-0.5">
                    {(t as typeof content["es"]).hoursClosed}
                  </p>
                </div>
              </div>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start text-xs font-bold text-primary underline underline-offset-4 hover:opacity-70 transition-opacity mt-1"
              >
                {(t as typeof content["es"]).mapsLink} →
              </a>
            </div>

            <div className="flex flex-col gap-4">
              <p className="font-bold text-foreground text-sm leading-snug">
                {(t as typeof content["es"]).ctaLabel}
              </p>
              <a
                href="https://wa.me/526863529089"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#188640] text-white px-5 py-4 font-bold text-sm rounded-sm hover:bg-[#157538] transition-colors shadow-sm w-full"
              >
                <WhatsAppIcon className="w-6 h-6 flex-shrink-0" />
                <div className="flex flex-col leading-tight text-left">
                  <span>{(t as typeof content["es"]).whatsappBtn}</span>
                  {/* Full white, not white/80: at 80% the phone number drops to 3.6:1 on the button. */}
                  <span className="font-normal text-white text-xs">{(t as typeof content["es"]).phone}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t-2 border-border bg-secondary/40 py-7">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            {(t as typeof content["es"]).footerLinks.map((link, i) => (
              <a key={link} href={FOOTER_HREFS[i]} className="font-semibold text-muted-foreground hover:text-primary transition-colors">
                {link}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {(t as typeof content["es"]).footerCopy}
          </p>
        </div>
      </footer>
    </div>
  );
}
