"use client";

import { useEffect } from "react";

export function ConsoleWarning() {
  useEffect(() => {
    let isCancelled = false;

    const titleStyle = [
      "color: #ef4444",
      "font-size: 56px",
      "font-weight: 800",
      "line-height: 1.1",
      "font-family: 'LINE Seed Sans TH', 'Segoe UI', Tahoma, sans-serif",
      "text-shadow: 0 2px 0 rgba(127, 29, 29, 0.15)",
    ].join(";");

    const bodyStyle = [
      "color: #ffffff",
      "font-size: 20px",
      "font-weight: 600",
      "line-height: 1.45",
      "font-family: 'LINE Seed Sans TH', 'Segoe UI', Tahoma, sans-serif",
    ].join(";");

    const linkStyle = [
      "color: #ffffff",
      "font-size: 24px",
      "font-weight: 600",
      "text-decoration: underline",
      "font-family: 'LINE Seed Sans TH', 'Segoe UI', Tahoma, sans-serif",
    ].join(";");

    const printWarning = () => {
      if (isCancelled) {
        return;
      }

      console.log("%cหยุด!", titleStyle);
      console.log(
        "%cนี่คือฟีเจอร์สำหรับนักพัฒนา หากมีใครให้คุณคัดลอกหรือวางโค้ดใน Console อาจเป็นการขโมยบัญชีหรือข้อมูลส่วนตัวของคุณ",
        bodyStyle,
      );
      console.log("%cNever paste code in DevTools you do not fully understand.", bodyStyle);
    };

    const boot = async () => {
      try {
        if (typeof document !== "undefined" && "fonts" in document) {
          await document.fonts.load("600 24px 'LINE Seed Sans TH'");
          await document.fonts.ready;
        }
      } catch {
        // Continue even if font probing fails.
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(printWarning);
      });
    };

    void boot();

    return () => {
      isCancelled = true;
    };
  }, []);

  return null;
}
