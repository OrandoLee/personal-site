"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  LANGUAGE_STORAGE_KEY,
  languageLabels,
  type SiteLanguage,
  translateText
} from "@/lib/language";

type LanguageContextValue = {
  language: SiteLanguage;
  hasChosenLanguage: boolean;
  splashEnabled: boolean;
  chooseLanguage: (language: SiteLanguage) => void;
  switchLanguage: (language: SiteLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const textOriginals = new WeakMap<Text, string>();
const attrOriginals = new WeakMap<Element, Map<string, string>>();
const translatableAttributes = [
  "aria-label",
  "title",
  "alt",
  "placeholder",
  "value"
] as const;

function shouldSkipElement(element: Element | null) {
  if (!element) {
    return true;
  }

  return Boolean(
    element.closest(
      "script, style, noscript, svg, canvas, code, pre, [data-no-translate]"
    )
  );
}

function applyTextNodeLanguage(node: Text, language: SiteLanguage) {
  if (shouldSkipElement(node.parentElement)) {
    return;
  }

  const knownOriginal = textOriginals.get(node);
  const currentText = node.data;
  const expectedText = knownOriginal
    ? translateText(knownOriginal, language)
    : undefined;
  const original =
    knownOriginal && currentText === expectedText ? knownOriginal : currentText;

  textOriginals.set(node, original);
  const translated = translateText(original, language);

  if (node.data !== translated) {
    node.data = translated;
  }
}

function applyElementAttributes(element: Element, language: SiteLanguage) {
  if (shouldSkipElement(element)) {
    return;
  }

  let originals = attrOriginals.get(element);

  if (!originals) {
    originals = new Map<string, string>();
    attrOriginals.set(element, originals);
  }

  for (const attribute of translatableAttributes) {
    if (!element.hasAttribute(attribute)) {
      originals.delete(attribute);
      continue;
    }

    const currentValue = element.getAttribute(attribute) ?? "";
    const knownOriginal = originals.get(attribute);
    const expectedValue = knownOriginal
      ? translateText(knownOriginal, language)
      : undefined;
    const original =
      knownOriginal && currentValue === expectedValue
        ? knownOriginal
        : currentValue;

    originals.set(attribute, original);
    const translated = translateText(original, language);

    if (currentValue !== translated) {
      element.setAttribute(attribute, translated);
    }
  }
}

function applyLanguageToTree(root: ParentNode, language: SiteLanguage) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          return /[\u3400-\u9fff]/.test(node.textContent ?? "")
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          return shouldSkipElement(node as Element)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT;
        }

        return NodeFilter.FILTER_REJECT;
      }
    }
  );

  let node: Node | null = walker.currentNode;

  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      applyTextNodeLanguage(node as Text, language);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      applyElementAttributes(node as Element, language);
    }

    node = walker.nextNode();
  }
}

function ChoiceGate({
  onChoose
}: {
  onChoose: (language: SiteLanguage) => void;
}) {
  return (
    <div className="language-gate" data-no-translate>
      <div className="language-gate__panel">
        <p className="language-gate__eyebrow">Language / 語言</p>
        <h1 className="language-gate__title">请选择网站中文显示方式</h1>
        <p className="language-gate__copy">
          Please choose before entering DELEE.
        </p>
        <div className="language-gate__actions">
          <button type="button" onClick={() => onChoose("zh-Hans")}>
            简体中文
          </button>
          <button type="button" onClick={() => onChoose("zh-Hant-TW")}>
            繁體中文
          </button>
        </div>
      </div>
    </div>
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SiteLanguage>("zh-Hans");
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [splashEnabled, setSplashEnabled] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const languageRef = useRef(language);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as
      | SiteLanguage
      | null;

    if (stored === "zh-Hans" || stored === "zh-Hant-TW") {
      setLanguage(stored);
      setHasChosenLanguage(true);
      setSplashEnabled(true);
      setIsBootstrapped(true);
      return;
    }

    setHasChosenLanguage(false);
    setSplashEnabled(false);
    setIsBootstrapped(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = languageLabels[language].htmlLang;
    document.documentElement.dataset.siteLanguage = language;
    applyLanguageToTree(document.body, language);

    observerRef.current?.disconnect();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          applyTextNodeLanguage(mutation.target as Text, languageRef.current);
          continue;
        }

        if (mutation.type === "attributes") {
          applyElementAttributes(mutation.target as Element, languageRef.current);
          continue;
        }

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            applyTextNodeLanguage(node as Text, languageRef.current);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            applyLanguageToTree(node as Element, languageRef.current);
          }
        });
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [...translatableAttributes],
      characterData: true,
      childList: true,
      subtree: true
    });
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [language]);

  const chooseLanguage = useCallback((nextLanguage: SiteLanguage) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    setLanguage(nextLanguage);
    setHasChosenLanguage(true);
    window.setTimeout(() => setSplashEnabled(true), 40);
  }, []);

  const switchLanguage = useCallback(
    (nextLanguage: SiteLanguage) => {
      if (nextLanguage === languageRef.current) {
        return;
      }

      document.body.classList.add("language-switching");

      window.setTimeout(() => {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
        setLanguage(nextLanguage);
      }, 140);

      window.setTimeout(() => {
        document.body.classList.remove("language-switching");
      }, 420);
    },
    []
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      hasChosenLanguage,
      splashEnabled: isBootstrapped && splashEnabled,
      chooseLanguage,
      switchLanguage
    }),
    [
      chooseLanguage,
      hasChosenLanguage,
      isBootstrapped,
      language,
      splashEnabled,
      switchLanguage
    ]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
      {isBootstrapped && !hasChosenLanguage ? (
        <ChoiceGate onChoose={chooseLanguage} />
      ) : null}
    </LanguageContext.Provider>
  );
}

export function useSiteLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useSiteLanguage must be used within LanguageProvider");
  }

  return context;
}
