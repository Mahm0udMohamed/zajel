import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "تأكيد الحذف",
  description = "هل أنت متأكد من أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
  confirmText = "حذف",
  cancelText = "إلغاء",
  variant = "destructive",
  icon,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const defaultIcon =
    variant === "destructive" ? (
      <AlertTriangle className="w-6 h-6 text-red-500" />
    ) : (
      <Trash2 className="w-6 h-6 text-purple-500" />
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {icon || defaultIcon}
            <DialogTitle className="text-lg font-semibold text-white">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-start gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
