"use client";

import { CacheProvider } from "@emotion/react";
import createCache, { type EmotionCache } from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import type { ThemeDirection } from "./ThemePreferences";

type InsertedStyle = {
  name: string;
  isGlobal: boolean;
};

type EmotionRegistry = {
  cache: EmotionCache;
  flush: () => InsertedStyle[];
};

const createEmotionRegistry = (direction: ThemeDirection): EmotionRegistry => {
  const cache = createCache(
    direction === "rtl"
      ? { key: "muirtl", stylisPlugins: [prefixer, rtlPlugin] }
      : { key: "muiltr" },
  );
  cache.compat = true;

  const prevInsert = cache.insert;
  let inserted: InsertedStyle[] = [];

  cache.insert = (selector, serialized, sheet, shouldCache) => {
    if (cache.inserted[serialized.name] === undefined) {
      inserted.push({
        name: serialized.name,
        isGlobal: !selector,
      });
    }

    return prevInsert(selector, serialized, sheet, shouldCache);
  };

  return {
    cache,
    flush: () => {
      const previousInserted = inserted;
      inserted = [];
      return previousInserted;
    },
  };
};

export function AppEmotionCacheProvider({
  children,
  direction,
}: {
  children: ReactNode;
  direction: ThemeDirection;
}) {
  const registry = useMemo(() => createEmotionRegistry(direction), [direction]);

  useServerInsertedHTML(() => {
    const inserted = registry.flush();
    if (inserted.length === 0) {
      return null;
    }

    let styles = "";
    const globals: InsertedStyle[] = [];

    inserted.forEach(({ name, isGlobal }) => {
      const style = registry.cache.inserted[name];
      if (typeof style === "string") {
        if (isGlobal) {
          globals.push({ name, isGlobal });
        } else {
          styles += style;
        }
      }
    });

    return (
      <>
        {globals.map(({ name }) => {
          const style = registry.cache.inserted[name];
          return (
            <style
              key={name}
              data-emotion={`${registry.cache.key}-global ${name}`}
              dangerouslySetInnerHTML={{ __html: typeof style === "string" ? style : "" }}
            />
          );
        })}
        {styles && (
          <style
            data-emotion={`${registry.cache.key} ${inserted
              .filter(({ isGlobal }) => !isGlobal)
              .map(({ name }) => name)
              .join(" ")}`}
            dangerouslySetInnerHTML={{ __html: styles }}
          />
        )}
      </>
    );
  });

  return (
    <CacheProvider value={registry.cache}>
      {children}
    </CacheProvider>
  );
}
