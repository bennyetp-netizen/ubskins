import { Wrench, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MAINTENANCE_MESSAGE_MN, MAINTENANCE_MESSAGE_EN } from "@/config/maintenance";

const Maintenance = () => {
  const { i18n } = useTranslation();
  const isMn = i18n.language === "mn";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
        <Shield className="h-10 w-10 text-primary-foreground" />
      </div>
      <div className="mb-4 flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-4 py-1.5 text-sm font-semibold text-warning">
        <Wrench className="h-4 w-4" />
        {isMn ? "Засварын горим" : "Maintenance mode"}
      </div>
      <h1 className="mb-3 font-display text-2xl font-bold sm:text-3xl">
        UB<span className="text-primary">Skins</span>
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        {isMn ? MAINTENANCE_MESSAGE_MN : MAINTENANCE_MESSAGE_EN}
      </p>
    </div>
  );
};

export default Maintenance;
