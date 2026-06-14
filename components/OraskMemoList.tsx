"use client";

import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { cn } from "@/lib/classNames";

type MemoItem = {
  id: string;
  text: string;
  checked: boolean;
  delay: string;
};

const initialItems: MemoItem[] = [
  { id: "question", text: "留下一条问题", checked: false, delay: "0ms" },
  { id: "suggestion", text: "留下一条建议", checked: false, delay: "360ms" },
  { id: "idea", text: "或一个想法。", checked: false, delay: "720ms" }
];

function createMemoItem() {
  return {
    id: `memo-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    text: "",
    checked: false,
    delay: "0ms"
  };
}

export function OraskMemoList() {
  const [items, setItems] = useState<MemoItem[]>(initialItems);
  const newItemRef = useRef<HTMLSpanElement | null>(null);
  const shouldFocusNewItem = useRef(false);

  useEffect(() => {
    if (shouldFocusNewItem.current && newItemRef.current) {
      shouldFocusNewItem.current = false;
      newItemRef.current.focus();
    }
  }, [items.length]);

  function toggleItem(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }

  function updateItem(id: string, text: string) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, text } : item))
    );
  }

  function addItem() {
    shouldFocusNewItem.current = true;
    setItems((current) => [...current, createMemoItem()]);
  }

  function handleEditableInput(id: string, event: FormEvent<HTMLSpanElement>) {
    updateItem(id, event.currentTarget.textContent ?? "");
  }

  return (
    <div className="orask-memo" aria-label="Orask 备忘录">
      <div className="orask-memo__paper">
        <div className="orask-memo__lines">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "orask-memo-item",
                item.checked && "orask-memo-item--checked"
              )}
              style={{ "--orask-row-delay": item.delay } as CSSProperties}
            >
              <button
                type="button"
                className="orask-memo-item__circle"
                aria-label={item.checked ? "取消勾选这一条" : "勾选这一条"}
                aria-pressed={item.checked}
                onClick={() => toggleItem(item.id)}
              >
                <svg
                  className="orask-memo-item__circle-svg"
                  viewBox="0 0 76 72"
                  aria-hidden="true"
                >
                  <path
                    pathLength="1"
                    d="M39 4.5c17.8 1.1 31.1 11.9 32.4 28.2 1.5 18.9-13.4 32-32.5 33.7C18.7 68.2 5.2 58.5 4.9 38.9 4.6 19.8 19.4 3.3 39 4.5Z"
                  />
                  <path
                    pathLength="1"
                    d="M38.7 7.8c14.8-.2 28 9.6 29.1 24.3 1.2 15.7-11.1 28.1-28.1 30.2-17.7 2.2-30.9-7.1-31.2-23.1C8.1 22.8 21.4 8 38.7 7.8Z"
                  />
                </svg>
                <svg
                  className="orask-memo-item__check-svg"
                  viewBox="0 0 76 72"
                  aria-hidden="true"
                >
                  <path
                    pathLength="1"
                    d="M19.2 37.4c5.5 5.7 10.1 10.6 14 15.9C42.9 37.8 52.8 24.9 62.5 15.8"
                  />
                  <path
                    pathLength="1"
                    d="M18 39.9c4.5 4.1 9.5 9.4 14.8 16.2 8.6-13.8 19.2-29.5 31-38.8"
                  />
                </svg>
              </button>
              <div className="orask-memo-item__body">
                <span
                  ref={
                    index === items.length - 1 && !item.text
                      ? newItemRef
                      : undefined
                  }
                  className="orask-memo-item__text"
                  contentEditable
                  aria-label="编辑这一条 Orask 想法"
                  onInput={(event) => handleEditableInput(item.id, event)}
                  suppressContentEditableWarning
                >
                  {item.text}
                </span>
                <span className="orask-memo-item__strike" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="orask-memo__add"
        aria-label="新增一条 Orask 想法"
        onClick={addItem}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
