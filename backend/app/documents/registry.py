"""Maps a document slug to its chat-turn function, template file, and display name.

Explicit dict, not derived from catalog.json at runtime, so a typo in a slug
fails at import time rather than at request time.
"""

from dataclasses import dataclass
from typing import Callable

from app.chat import ChatMessage
from app.documents import (
    ai_addendum,
    baa,
    csa,
    design_partner,
    dpa,
    mnda,
    partnership,
    pilot,
    psa,
    sla,
    software_license,
)
from pydantic import BaseModel


@dataclass(frozen=True)
class DocumentSpec:
    slug: str
    catalog_name: str
    template_file: str
    document_title: str
    run_chat_turn: Callable[[list[ChatMessage]], BaseModel]


REGISTRY: dict[str, DocumentSpec] = {
    module.SLUG: DocumentSpec(
        slug=module.SLUG,
        catalog_name=module.CATALOG_NAME,
        template_file=module.TEMPLATE_FILE,
        document_title=module.DOCUMENT_TITLE,
        run_chat_turn=module.run_chat_turn,
    )
    for module in (
        mnda,
        pilot,
        design_partner,
        partnership,
        baa,
        csa,
        psa,
        software_license,
        sla,
        dpa,
        ai_addendum,
    )
}
