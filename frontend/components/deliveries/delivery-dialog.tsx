import { ModalDialog } from "@/components/ui/modal-dialog";

export function DeliveryDialog({
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
    <ModalDialog title={title} eyebrow={eyebrow} onClose={onClose} maxWidthClassName="max-w-5xl">
      {children}
    </ModalDialog>
  );
}
