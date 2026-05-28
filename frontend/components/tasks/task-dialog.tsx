import { ModalDialog } from "@/components/ui/modal-dialog";

export function TaskDialog({
  title,
  eyebrow,
  onClose,
  children
}: Readonly<{
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
}>) {
  return (
    <ModalDialog title={title} eyebrow={eyebrow} onClose={onClose}>
      {children}
    </ModalDialog>
  );
}
