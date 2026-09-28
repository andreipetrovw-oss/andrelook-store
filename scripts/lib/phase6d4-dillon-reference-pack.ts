import type { ImageRole } from "@prisma/client";

export const PHASE6D4_PRODUCT_CODE = "AL-SRC-CPREPSCN-218824597";

export const phase6d4Method =
  "CONTROLLED_GENERATIVE_MULTI_REFERENCE_RECONSTRUCTION_V1";

export const dillonCompleteEvidencePositions = Array.from(
  { length: 21 },
  (_, index) => index + 1,
);

export const dillonInvariantMap = [
  {
    area: "reference-pack-scope",
    evidencePositions: [1],
    requirement:
      "The size-chart frame remains private contextual evidence only and supplies no visual garment geometry or invented commercial fact.",
  },
  {
    area: "silhouette-and-proportions",
    evidencePositions: [2, 3, 4],
    requirement:
      "Short boxy puffer silhouette; complete sleeves, collar and hem; front/back width and length remain mutually consistent.",
  },
  {
    area: "quilting-seams-and-volume",
    evidencePositions: [2, 3, 4, 5, 6, 8],
    requirement:
      "Broad horizontal baffles, shoulder and sleeve seam layout, natural down volume and source-supported panel boundaries.",
  },
  {
    area: "collar-and-orange-details",
    evidencePositions: [2, 3, 6, 8, 10, 13, 21],
    requirement:
      "High stand collar without a hood; black inner facing; orange neck loop/stitch accents only where shown.",
  },
  {
    area: "yellow-closure-and-snaps",
    evidencePositions: [2, 3, 11, 12],
    requirement:
      "Yellow woven closure geometry, black edging, stitch lines and metal snap placement remain source-supported.",
  },
  {
    area: "zipper-hardware-and-pockets",
    evidencePositions: [2, 3, 6, 12, 14],
    requirement:
      "Two-way center zipper, black pull tapes, metal sliders and the two front zip-pocket positions/angles remain unchanged.",
  },
  {
    area: "cuffs-and-hem",
    evidencePositions: [2, 3, 4, 7, 11, 13],
    requirement:
      "Elastic outer cuffs, internal rib storm cuffs, supported snap details and padded straight hem remain intact.",
  },
  {
    area: "sleeve-patch-and-branding",
    evidencePositions: [2, 3, 11, 12, 15, 16, 21],
    requirement:
      "Patch/label placement and visible identity marks may be retained only from evidence; unsupported or approximate text is forbidden.",
  },
  {
    area: "interior-construction",
    evidencePositions: [5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21],
    requirement:
      "Light-gray lining, black lower panels, asymmetric interior pockets, mesh/yellow detail, labels and orange tab keep their evidenced positions.",
  },
  {
    area: "material-colour-and-finish",
    evidencePositions: [2, 3, 4, 5, 6, 12, 14],
    requirement:
      "Very dark navy-black satin/gloss relationship and realistic textile texture remain consistent across the set; no commercial colour claim is inferred.",
  },
] as const;

type StudioRole = Exclude<
  ImageRole,
  "ADDITIONAL" | "ALTERNATIVE" | "GALLERY" | "SIDE" | "SIZE_CHART"
>;

export type Phase6d4CandidateDefinition = {
  filename: string;
  fidelityFindings: readonly string[];
  generationInputPositions: readonly number[];
  iterationHistory: readonly string[];
  method: typeof phase6d4Method;
  primaryPosition: number;
  purpose: string;
  role: StudioRole;
  supportingPositions: readonly number[];
  uncertaintyNotes: readonly string[];
  version: number;
};

export const phase6d4Candidates = [
  {
    filename: "andrelook-al-src-cprepscn-218824597-primary-v02.png",
    fidelityFindings: [
      "Full silhouette, baffle rhythm, front pockets, collar closure, zipper and sleeve-patch placement are source-supported.",
      "Second pass corrected body proportion and pocket/baffle geometry without adding a new view.",
    ],
    generationInputPositions: [2, 3, 4, 12, 14],
    iterationHistory: [
      "Pass 1 established the Studio lighting, volume and neutral background.",
      "Pass 2 targeted boxier source proportions, pocket positions and baffle geometry; pass 1 was superseded.",
    ],
    method: phase6d4Method,
    primaryPosition: 2,
    purpose: "Premium storefront card and product-page hero preview",
    role: "PRIMARY",
    supportingPositions: [3, 4, 12, 14],
    uncertaintyNotes: [
      "Owner must compare the small sleeve patch and collar strap at full resolution.",
      "Dark source frames vary in white balance; no commercial colour name is asserted.",
    ],
    version: 2,
  },
  {
    filename: "andrelook-al-src-cprepscn-218824597-front-v02.png",
    fidelityFindings: [
      "Closed straight-front geometry follows the supplier flat view and catalog reference.",
      "Cuff, collar strap and two-way zipper details are cross-checked against dedicated sources.",
    ],
    generationInputPositions: [3, 2, 11, 12, 14],
    iterationHistory: [
      "One controlled front reconstruction pass survived the full-set consistency review; no variation pass was needed.",
    ],
    method: phase6d4Method,
    primaryPosition: 3,
    purpose: "Closed straight-on construction view",
    role: "FRONT",
    supportingPositions: [2, 11, 12, 14],
    uncertaintyNotes: [
      "Tiny sleeve-patch wording remains an owner-review point and is not used as factual text.",
    ],
    version: 2,
  },
  {
    filename: "andrelook-al-src-cprepscn-218824597-back-v02.png",
    fidelityFindings: [
      "Rear collar, orange stitch accent, shoulder/sleeve seams, baffle spacing and hem are source-supported.",
      "No rear branding, pockets, hood or invented center feature was added.",
    ],
    generationInputPositions: [4, 3, 8, 10, 13],
    iterationHistory: [
      "One controlled back reconstruction pass survived the full-set consistency review; no variation pass was needed.",
    ],
    method: phase6d4Method,
    primaryPosition: 4,
    purpose: "Straight-on rear construction view",
    role: "BACK",
    supportingPositions: [3, 8, 10, 13],
    uncertaintyNotes: [
      "The owner should compare the rear collar gathering and center orange stitch at 100%.",
    ],
    version: 2,
  },
  {
    filename: "andrelook-al-src-cprepscn-218824597-interior-v02.png",
    fidelityFindings: [
      "Open-jacket geometry, lining baffles, lower black panels, pocket asymmetry and orange/yellow accents remain source-supported.",
      "The unsupported secondary microtext was removed from readable view; only evidenced top identity text remains visible.",
    ],
    generationInputPositions: [5, 6, 9, 15, 21],
    iterationHistory: [
      "Pass 1 was rejected because it synthesized readable secondary label text.",
      "Pass 2 removed the loose care label but retained false story-label microtext and was rejected.",
      "Pass 3 tucked the secondary woven label into the mesh pocket so unsupported text is not falsely rendered.",
    ],
    method: phase6d4Method,
    primaryPosition: 5,
    purpose: "Open interior construction and pocket-layout view",
    role: "INTERIOR",
    supportingPositions: [6, 9, 15, 21],
    uncertaintyNotes: [
      "Owner must verify top-label typography against source 21 at full resolution.",
      "Secondary care/story copy is intentionally not presented as readable product evidence.",
    ],
    version: 2,
  },
  {
    filename: "andrelook-al-src-cprepscn-218824597-branding-v01.png",
    fidelityFindings: [
      "Yellow woven closure, snap, black edging, collar volume, orange loop and center zipper relationship are source-supported.",
      "No unsupported marketing copy was added.",
    ],
    generationInputPositions: [12, 3, 2, 11, 14],
    iterationHistory: [
      "One signature-detail reconstruction pass survived full-resolution comparison; no variation pass was needed.",
    ],
    method: phase6d4Method,
    primaryPosition: 12,
    purpose: "Signature yellow collar-closure detail",
    role: "BRANDING",
    supportingPositions: [2, 3, 11, 14],
    uncertaintyNotes: [
      "Owner must reject the candidate if the small snap or pull mark differs from source at 100%.",
    ],
    version: 1,
  },
  {
    filename: "andrelook-al-src-cprepscn-218824597-hardware-v01.png",
    fidelityFindings: [
      "Two-way zipper construction, metal sliders, black woven pulls, shell weave and yellow-detail context are source-supported.",
      "No engraved wording is presented as factual text.",
    ],
    generationInputPositions: [14, 12, 3, 10, 11],
    iterationHistory: [
      "One hardware/material reconstruction pass survived full-resolution comparison; no variation pass was needed.",
    ],
    method: phase6d4Method,
    primaryPosition: 14,
    purpose: "Zipper, pull-tape, snap and shell-material detail",
    role: "HARDWARE",
    supportingPositions: [3, 10, 11, 12],
    uncertaintyNotes: [
      "Fine hardware wear and any tiny engraving require owner comparison at 100%.",
    ],
    version: 1,
  },
] as const satisfies readonly Phase6d4CandidateDefinition[];

export const phase6d4RejectedPasses = [
  {
    filename: "primary-pass-01-superseded.png",
    reason:
      "Superseded after a targeted proportion, pocket-position and baffle-geometry revision.",
  },
  {
    filename: "interior-pass-01-invented-microtext.png",
    reason: "Rejected for synthesized readable secondary label text.",
  },
  {
    filename: "interior-pass-02-false-microtext.png",
    reason:
      "Rejected because the secondary story label still contained generated body copy.",
  },
] as const;

export const phase6d4UnsupportedClaims = [
  "No candidate establishes price, stock, availability, authenticity, origin, composition or a commercial colour name.",
  "No candidate is an owner approval, publication approval or public ProductImage.",
  "The unsupported three-quarter/side view is omitted rather than synthesized.",
] as const;
