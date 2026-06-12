import { Shield, Mail, MessageCircle, Facebook } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
  <footer className="border-t border-border/60 bg-card/40">
    <div className="container py-12">
      <div className="grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            UB<span className="text-primary">Skins</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {t("footer.tagline")}
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">{t("footer.links")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t("footer.home")}</li>
            <li>{t("footer.shop")}</li>
            <li>{t("footer.faq")}</li>
            <li>{t("footer.terms")}</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">{t("footer.contact")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@ubskins.mn</li>
            <li>
              <a
                href="https://www.facebook.com/profile.php?id=61590372189026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#1877F2] px-3 py-2 font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Facebook className="h-4 w-4" /> {t("footer.facebookPage")}
              </a>
            </li>
            <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> {t("footer.discord")}</li>
          </ul>
        </div>
      </div>
      <div className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UBSkins — {t("footer.rights")}
      </div>
    </div>
  </footer>
  );
};

export default Footer;
