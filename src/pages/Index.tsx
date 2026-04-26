import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, LogIn, MousePointerClick, CreditCard, Send, Sparkles, Gauge, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SkinCard from "@/components/SkinCard";
import { skins } from "@/data/skins";
import heroBg from "@/assets/hero-bg.jpg";

const steps = [
  { icon: LogIn, title: "Steam-р нэвтэрнэ", desc: "Steam OpenID-р найдвартай нэвтэрч, trade URL-аа холбоно." },
  { icon: MousePointerClick, title: "Скинээ сонгоно", desc: "Зэвсэг, wear, float, үнээр шүүж тохирох скинээ ол." },
  { icon: CreditCard, title: "Storepay/QPay-р төлнө", desc: "Төгрөгөөр шууд эсвэл 4 хуваан хүүгүй төлбөр." },
  { icon: Send, title: "Trade offer хүлээн авна", desc: "Төлбөр баталгаажмагц Steam trade offer автоматаар очно." },
];

const trust = [
  { icon: ShieldCheck, title: "Gamble биш", desc: "Case opening, betting, jackpot үгүй. Зөвхөн шууд худалдаа." },
  { icon: Gauge, title: "Шуурхай хүргэлт", desc: "Төлбөр баталгаажсаны дараа дунджаар 5 минутад trade offer." },
  { icon: Lock, title: "Найдвартай төлбөр", desc: "QPay, Storepay, банкны шилжүүлэг — албан ёсны интеграц." },
];

const faqs = [
  { q: "Storepay-р яаж худалдан авах вэ?", a: "Buy with Storepay товчийг дарж дансаараа нэвтэрснээр үнийн дүнг 4 хувааж, хүүгүй төлнө. Эхний төлбөр шууд төлөгдөнө." },
  { q: "Хэдийд скин минийх болох вэ?", a: "Төлбөр баталгаажсаны дараа Steam trade offer-р хүргэгдэнэ. Та Steam-д trade offer-оо хүлээн авч баталгаажуулаарай." },
  { q: "Энэ gambling уу?", a: "Үгүй. Манай платформ дээр case opening, roulette, jackpot, betting байхгүй. Зөвхөн store inventory-оос шууд скин худалдаалдаг." },
  { q: "Trade hold хэр удаан байх вэ?", a: "Steam Mobile Authenticator идэвхжүүлсэн бол шууд. Үгүй бол Valve-н нөхцөлөөр 7-15 хоног." },
  { q: "Үнэ юунд тулгуурладаг вэ?", a: "Steam Market болон third-party-н дундаж үнэд тулгуурлан, MNT ханшаар тооцон тогтоодог." },
];

const Index = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroBg} alt="" width={1920} height={1024} className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        <div className="container relative grid gap-10 py-20 md:py-32 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Монголын анхны CS2 скиний дэлгүүр
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              CS2 скинээ <span className="text-gradient-primary">төгрөгөөр</span>,
              <br />
              Storepay-р <span className="text-accent">хуваан төлөөд</span> аваарай
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Найдвартай шууд худалдаа. Gamble биш. Steam-р нэвтрээд, дуртай скинээ сонгоод, төгрөгөөр төлж, хэдхэн минутад trade offer хүлээн ав.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button variant="hero" size="xl">
                  Скин үзэх <ArrowRight className="ml-1" />
                </Button>
              </Link>
              <Button variant="steam" size="xl">
                <LogIn className="mr-1" />
                Steam-р нэвтрэх
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> 100% албан ёсны</div>
              <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> 5 мин хүргэлт</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Steam OpenID</div>
            </div>
          </div>

          {/* visual */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square">
              <div className="absolute inset-10 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute inset-20 rounded-full bg-accent/20 blur-3xl" />
              <img
                src={skins[0].image}
                alt="Featured skin"
                className="relative animate-float-slow drop-shadow-[0_20px_60px_hsl(186_100%_50%/0.4)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="container py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {trust.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border bg-gradient-card p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Хэрхэн ажилладаг вэ</h2>
          <p className="mt-2 text-muted-foreground">4 алхамд скинээ авах</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-gradient-card p-6">
              <span className="absolute right-4 top-4 font-display text-3xl font-bold text-muted-foreground/20">
                0{i + 1}
              </span>
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Онцлох скинүүд</h2>
            <p className="mt-2 text-muted-foreground">Хамгийн их эрэлттэй сонголтууд</p>
          </div>
          <Link to="/shop" className="hidden text-sm text-primary hover:underline sm:inline">
            Бүгдийг үзэх →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skins.slice(0, 4).map((s) => (
            <SkinCard key={s.id} skin={s} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Түгээмэл асуултууд</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`f-${i}`}
                className="rounded-2xl border border-border bg-gradient-card px-5"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-10 text-center md:p-16">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              Анхны скинээ <span className="text-gradient-primary">өнөөдөр</span> аваарай
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Storepay-р 4 хуваагаад л хэрэгтэй скиндээ хүрнэ.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/shop"><Button variant="hero" size="xl">Скин үзэх</Button></Link>
              <Button variant="steam" size="xl"><LogIn className="mr-1" /> Steam-р нэвтрэх</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
