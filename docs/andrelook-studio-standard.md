# Andrelook Studio product-image standard

Status: approved workflow foundation. Phase 6D.1 does not bulk-process the 1,431 source images or generate public product images.

## Universal requirements

- Master aspect ratio: 4:5 portrait for catalog and primary product imagery.
- Working master: minimum 2400×3000 px after crop; prefer a source whose shortest dimension is at least 2400 px.
- Colour space: sRGB; neutral white balance; no clipped whites/blacks that erase real material detail.
- Background: warm near-white derived from Andrelook (`#F5F2ED` to `#FFFFFF`), uniform across the set.
- Product occupies roughly 72–82% of frame height/width as appropriate, centered optically rather than mechanically.
- Safe margins: minimum 8% on all sides; preserve extra top space around hoods/hangers and bottom space around hems/objects.
- Lighting: broad, soft, slightly directional studio light; accurate colour and texture; no fashion-scene props.
- Shadow: subtle natural contact/drop shadow only, low contrast and consistent direction; never a floating cutout or dramatic hard shadow.
- Retouching may remove background distractions, dust, or capture artifacts only when it does not alter the product.
- Never invent, add, remove, redraw, sharpen into existence, or alter details, logos, labels, stitching, materials, hardware, colours, proportions, condition, or authenticity indicators.
- Never merge visual variants into one product. Each processed asset must trace to its exact source product and source frame.

## A. Hanging garments

Use for jackets, coats, overshirts, cardigans, hoodies, sweaters, and other garments whose structure reads naturally on a hanger.

- Aspect/framing: 4:5; garment centered on a simple invisible/neutral hanger treatment; complete hem and sleeves visible.
- Scale: 76–82% of frame height; balanced sleeve clearance; shoulders level unless the source product itself is asymmetric.
- Camera: straight-on, lens axis at garment midline; back and detail frames use the same elevation/distance.
- Crop: never crop hood, collar, cuffs, sleeve ends, hem, or meaningful hardware in the primary view.
- Shadow: soft shadow directly behind/below, consistent with broad frontal light.
- Sequence: front primary; back; left/right or three-quarter construction view; logo/label; fabric/trim; hardware/closure; verified size-chart frame when applicable.
- Reject: distorted hanger shoulders, uneven geometry caused by processing, hidden sleeve/hem, perspective stretch, false symmetry, erased labels, or source resolution below the minimum without an approved exception.

## B. Flat-lay / surface garments

Use for T-shirts, polos, knitwear, trousers, shorts, and pieces that present more truthfully laid flat.

- Aspect/framing: 4:5; overhead surface, garment aligned vertically and fully visible.
- Scale: 74–82% of frame; natural sleeves/legs arranged consistently without changing shape or fit evidence.
- Camera: true overhead (approximately 90°); avoid oblique keystone distortion.
- Background: uniform matte warm-white surface without folds, seams, props, hands, or unrelated objects.
- Margins: at least 8%; equal visual breathing room; keep collars, cuffs, waistbands, and hems complete.
- Shadow: very soft contact shadow only; never simulate depth the source does not support.
- Sequence: front primary; back; detail of branding; fabric/stitching; closures/pockets; variant-specific views; verified chart.
- Reject: artificial garment reshaping, mirrored details, removed creases that encode real construction, clipped limbs/hem, colour cast, mixed backgrounds, or inconsistent scale across a product set.

## C. Product / accessory objects

Use for headwear and other non-hanging objects.

- Aspect/framing: 4:5 canvas; object centered with shape-appropriate optical balance.
- Scale: 65–78% of frame, preserving full silhouette and enough negative space for cards/crops.
- Camera: primary three-quarter view when it communicates form best; add direct front, side, back, top/interior, and detail views as supported by the source.
- Background: seamless warm near-white; no display stands unless unavoidable and explicitly approved.
- Shadow: restrained elliptical/contact shadow matched to the real object footprint.
- Crop: no clipped brims, straps, peaks, fasteners, or protruding hardware.
- Sequence: hero three-quarter; front; side; back; top/interior; logo/label; materials/hardware; size/adjustment evidence.
- Reject: invented underside/interior, reconstructed missing logo/label, changed hardware colour, smoothed-away texture, asymmetrical perspective artifacts, or background reflections that contaminate colour.

## Acceptance checklist

An asset is accepted only when:

1. its exact product/source identity and source-frame reference are recorded;
2. all visible facts match the source on pixel-level review at 100%;
3. dimensions/aspect ratio and safe margins meet the selected template;
4. colour, materials, hardware, branding, and construction remain faithful;
5. the primary view is complete, centered, sharp, and free of unrelated objects;
6. the set sequence is coherent and contains no duplicate/mismatched variant;
7. owner review approves it for customer publication;
8. an Andrelook-controlled public asset is created separately from the private source reference.

If any product fact is ambiguous, reject or hold for review. Presentation consistency never overrides source truth.

## Deterministic asset system

- Preserve the untouched highest-resolution source privately with its source-image database ID and SHA-256 when available.
- Working master canvas: 2400×3000 px, 4:5, sRGB.
- Public derivatives: 480×600, 960×1200, 1440×1800 and 2400×3000 where the source supports them; WebP/AVIF may supplement a high-quality JPEG master.
- Naming: `andrelook-{product-internal-code}-{role}-v{two-digit-version}-{width}x{height}.{ext}` using lower-case ASCII and the canonical role.
- A new visual treatment creates a new version. Never overwrite a previously owner-approved master in place.
- The private `StudioCandidate` records product, role, deterministic version, private master, primary/supporting source references, method, technical QA, fidelity checklist and explicit owner decision. It is never silently overwritten.
- A separate `ProductImage` may be created only by a later explicit public-promotion operation after owner approval.

## Owner review workflow

`PRIVATE SOURCE → SOURCE SELECTED → STUDIO CANDIDATE → SIDE-BY-SIDE FIDELITY REVIEW → OWNER APPROVED → PUBLIC PRODUCT IMAGE`

The private CRM renders supplier sources and private Studio candidates only through authenticated same-origin proxies. Candidates remain in private Blob storage while the owner compares them side by side and completes the fidelity gate. Candidate approval, rejection or revision does not create a public `ProductImage`. Public derivatives and public Blob upload are a distinct, later promotion step requiring validated localized alt text and explicit publication authorization.

## Preferred gallery order

1. Главная
2. Спереди
3. Сзади
4. Сбоку — only when supported by the source
5. Внутри — only when supported by the source
6. Детали
7. Фурнитура / branding detail where useful
8. Размерная сетка

Unsupported views are omitted, not synthesized. Catalog-card primary images must use the same 4:5 framing, scale band, margins, neutral warm background and restrained shadow standard.
