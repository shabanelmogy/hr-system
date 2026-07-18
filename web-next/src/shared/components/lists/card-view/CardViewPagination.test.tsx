import { renderToStaticMarkup } from "react-dom/server";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import CardViewPagination from "./CardViewPagination";

describe("CardViewPagination", () => {
  it("uses the localized fallback item label during server rendering", async () => {
    const i18n = createInstance();
    await i18n.init({
      lng: "ar",
      resources: {
        ar: {
          translation: {
            pagination: {
              showing: "عرض",
              of: "من",
              items: "العناصر",
              itemsPerPage: "عدد العناصر في الصفحة",
            },
          },
        },
      },
    });

    const html = renderToStaticMarkup(
      <I18nextProvider i18n={i18n}>
        <CardViewPagination
          page={0}
          rowsPerPage={10}
          totalItems={23}
          itemsPerPageOptions={[10, 20]}
          onPageChange={() => undefined}
          onRowsPerPageChange={() => undefined}
        />
      </I18nextProvider>,
    );

    expect(html).toContain("1-10");
    expect(html).toContain("العناصر");
  });
});
