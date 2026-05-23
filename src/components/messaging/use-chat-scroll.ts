import { useCallback, useLayoutEffect, useRef } from "react";

/** Keeps a chat message list pinned to the latest message. */
export function useChatScroll(messageKey: string | undefined) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldStickRef = useRef(true);

  const isNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance < 120;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = scrollRef.current;
    if (!el) return;

    const run = () => {
      el.scrollTo({ top: el.scrollHeight, behavior });
    };

    run();
    requestAnimationFrame(run);
  }, []);

  useLayoutEffect(() => {
    if (!messageKey) return;
    if (shouldStickRef.current) {
      scrollToBottom("auto");
    }
  }, [messageKey, scrollToBottom]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function onScroll() {
      shouldStickRef.current = isNearBottom();
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isNearBottom]);

  const stickToBottom = useCallback(() => {
    shouldStickRef.current = true;
    scrollToBottom("auto");
  }, [scrollToBottom]);

  return { scrollRef, scrollToBottom, stickToBottom, isNearBottom };
}
