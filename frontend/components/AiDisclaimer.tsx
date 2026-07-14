/**
 * Shown wherever a generated document is rendered (live preview, history
 * detail, and the printed/downloaded PDF) - intentionally not `print:hidden`.
 */
export default function AiDisclaimer() {
  return (
    <p className="text-xs italic text-black/50">
      This document was drafted by an AI assistant and has not been reviewed by an attorney. Have
      it reviewed by a qualified lawyer before you rely on or sign it.
    </p>
  );
}
