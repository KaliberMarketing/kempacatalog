import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, "success" | "warning" | "secondary" | "destructive" | "outline"> = {
  active: "success",
  paused: "warning",
  inactive: "secondary",
  disabled: "destructive",
  archived: "outline",
  completed: "success",
  draft: "secondary",
};

function humanize(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariant[status] ?? "outline"}>
      {humanize(status)}
    </Badge>
  );
}
