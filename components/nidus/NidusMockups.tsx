"use client";

import { useState } from "react";
import NidusDashboardDetailView from "@/components/nidus/NidusDashboardDetail";
import NidusEnergyDetailView from "@/components/nidus/NidusEnergyDetail";
import { useLanguage } from "@/hooks/useLanguage";
import type { Bilingual } from "@/types/content";
import type {
  NidusDashboardDetail,
  NidusEnergyDetail,
  NidusMockupScreen,
  NidusMockupWidget,
  NidusSidebarItem,
} from "@/types/nidusCaseStudy";
import styles from "@/styles/nidusMockup.module.css";

type Device = "web" | "mobile";

interface NidusMockupsProps {
  mockups: NidusMockupScreen[];
  sidebarItems: NidusSidebarItem[];
  dashboardDetail: NidusDashboardDetail;
  energyDetail: NidusEnergyDetail;
  note: Bilingual;
}

interface WidgetCardProps {
  widget: NidusMockupWidget;
  translate: (text: Bilingual) => string;
}

function WidgetCard({ widget, translate }: WidgetCardProps) {
  return (
    <article className={styles.widgetCard}>
      <p className={styles.widgetLabel}>{translate(widget.label)}</p>
      <p className={styles.widgetValue}>{widget.value}</p>
      {widget.meta ? (
        <p className={styles.widgetMeta}>{translate(widget.meta)}</p>
      ) : null}
    </article>
  );
}

export default function NidusMockups({
  mockups,
  sidebarItems,
  dashboardDetail,
  energyDetail,
  note,
}: NidusMockupsProps) {
  const { language, t } = useLanguage();
  const [device, setDevice] = useState<Device>("web");
  const [activeScreenId, setActiveScreenId] = useState(
    () => mockups[0]?.id ?? "",
  );

  const activeScreen =
    mockups.find((screen) => screen.id === activeScreenId) ?? mockups[0];

  if (!activeScreen) {
    return <p className={styles.note}>{t(note)}</p>;
  }

  const deviceLabels = {
    web: "Web",
    mobile: language === "nl" ? "Mobiel" : "Mobile",
  } satisfies Record<Device, string>;

  const renderMobileTabs = () => (
    <nav
      className={styles.mobileTabs}
      aria-label={language === "nl" ? "Mockupschermen" : "Mockup screens"}
    >
      {mockups.map((screen) => {
        const isActive = screen.id === activeScreen.id;
        const sidebarItem = sidebarItems.find((item) => item.id === screen.id);

        return (
          <button
            key={screen.id}
            type="button"
            className={isActive ? styles.mobileTabActive : styles.mobileTab}
            aria-pressed={isActive}
            onClick={() => setActiveScreenId(screen.id)}
          >
            <span aria-hidden="true">{sidebarItem?.icon}</span>
            {t(sidebarItem?.label ?? screen.navLabel)}
          </button>
        );
      })}
    </nav>
  );

  const screenContent = (
    <div key={activeScreen.id} className={styles.screenContent}>
      {activeScreen.id === "dashboard" ? (
        <NidusDashboardDetailView detail={dashboardDetail} />
      ) : activeScreen.id === "energie" ? (
        <NidusEnergyDetailView detail={energyDetail} />
      ) : (
        <>
          <p className={styles.productLabel}>NIDUS</p>
          <h3 className={styles.screenTitle}>{t(activeScreen.title)}</h3>
          <div
            className={
              device === "web" ? styles.widgetGrid : styles.widgetStack
            }
          >
            {activeScreen.widgets.map((widget) => (
              <WidgetCard
                key={`${activeScreen.id}-${widget.label.en}`}
                widget={widget}
                translate={t}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className={styles.mockups}>
      <p className={styles.note}>{t(note)}</p>

      <div
        className={styles.deviceToggle}
        role="tablist"
        aria-label={language === "nl" ? "Apparaatweergave" : "Device view"}
      >
        {(Object.keys(deviceLabels) as Device[]).map((deviceOption) => {
          const isActive = device === deviceOption;

          return (
            <button
              key={deviceOption}
              type="button"
              className={isActive ? styles.deviceActive : styles.deviceButton}
              aria-pressed={isActive}
              onClick={() => setDevice(deviceOption)}
            >
              {deviceLabels[deviceOption]}
            </button>
          );
        })}
      </div>

      {device === "web" ? (
        <div className={`${styles.nidusFrame} ${styles.browserFrame}`}>
          <div className={styles.browserChrome}>
            <div className={styles.windowControls} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className={styles.webLayout}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarBrand}>
                <p>NIDUS</p>
                <span>{dashboardDetail.greetingName}</span>
              </div>

              <nav
                className={styles.sidebarNav}
                aria-label={
                  language === "nl" ? "Nidus-navigatie" : "Nidus navigation"
                }
              >
                {sidebarItems.map((item) => {
                  if (!item.enabled) {
                    return (
                      <span
                        key={item.id}
                        className={styles.sidebarItemDisabled}
                        aria-disabled="true"
                      >
                        <span aria-hidden="true">{item.icon}</span>
                        {t(item.label)}
                      </span>
                    );
                  }

                  const isActive = item.id === activeScreen.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        isActive
                          ? styles.sidebarItemActive
                          : styles.sidebarItem
                      }
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setActiveScreenId(item.id)}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      {t(item.label)}
                    </button>
                  );
                })}
              </nav>

              <p className={styles.sidebarFooter}>
                {language === "nl" ? "Uitloggen" : "Log out"}
              </p>
            </aside>

            <div className={styles.contentPane}>{screenContent}</div>
          </div>
        </div>
      ) : (
        <div className={`${styles.nidusFrame} ${styles.phoneFrame}`}>
          <div className={styles.phoneStatus} aria-hidden="true">
            <span>9:41</span>
            <span className={styles.phoneNotch} />
            <span>5G&nbsp;&nbsp;100%</span>
          </div>
          <div className={styles.phoneBody}>{screenContent}</div>
          {renderMobileTabs()}
        </div>
      )}
    </div>
  );
}
