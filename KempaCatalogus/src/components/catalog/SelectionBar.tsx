'use client';

type SelectionBarProps = {
  selectedCount: number;
  onExportPdf: () => void;
  onRequestInquiry?: () => void;
};

export function SelectionBar({
  selectedCount,
  onExportPdf,
  onRequestInquiry,
}: SelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-4 z-20 mt-4 flex items-center justify-between rounded-full border border-[color-mix(in_srgb,var(--color-text)_8%,var(--color-secondary)_92%)] bg-[color-mix(in_srgb,var(--color-secondary)_96%,#ffffff_4%)] px-4 py-2 shadow-lg shadow-black/5 backdrop-blur">
      <p className="text-sm text-[color-mix(in_srgb,var(--color-text)_80%,#4b5563_20%)]">
        {selectedCount} product
        {selectedCount === 1 ? "" : "en"} geselecteerd
      </p>
      <div className="flex items-center gap-2">
        {onRequestInquiry && (
          <button
            type="button"
            onClick={onRequestInquiry}
            className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--color-text)_10%,#e5e7eb_90%)] bg-white px-3 py-1.5 text-sm font-medium text-[color-mix(in_srgb,var(--color-text)_88%,#111827_12%)] shadow-sm transition hover:bg-[color-mix(in_srgb,var(--color-bg)_92%,#f3f4f6_8%)]"
          >
            Aanvraag sturen
          </button>
        )}
        <button
          type="button"
          onClick={onExportPdf}
          className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-[color-mix(in_srgb,var(--color-accent)_85%,#111827_15%)]"
        >
          Exporteer als PDF
        </button>
      </div>
    </div>
  );
}

