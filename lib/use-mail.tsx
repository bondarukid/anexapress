"use client";

import * as React from "react";

type MailState = {
  selected: string | null;
};

const MailContext = React.createContext<{
  mail: MailState;
  setMail: React.Dispatch<React.SetStateAction<MailState>>;
} | null>(null);

export function MailProvider({
  children,
  initialSelected,
}: {
  children: React.ReactNode;
  initialSelected: string | null;
}) {
  const [mail, setMail] = React.useState<MailState>({
    selected: initialSelected,
  });

  return <MailContext.Provider value={{ mail, setMail }}>{children}</MailContext.Provider>;
}

export function useMail() {
  const ctx = React.useContext(MailContext);
  if (!ctx) throw new Error("useMail must be used within MailProvider");
  return [ctx.mail, ctx.setMail] as const;
}
