# Combo Landing Page — Media Requirements

**Module:** Combo
**Route:** `/combo`, `/combo/tat-ca`

This documents every asset used by the Combo module and whether it is a **Demo Asset** (licensed stock, used only to make this demo presentable) or a **Production Asset** (real Minh Việt-owned photography/video). Every asset is referenced by path from `lib/combo/combo-data-seed.ts` only — no component hardcodes an image/video path — so replacing any of them later is a one-line edit in that single seed file, never a code change.

**Context:** the first pass of this module strictly limited stock photography to category tiles only and capped Destination Explorer at 3 destinations (only those with real assets), to avoid overstating what Minh Việt could show. After reviewing that pass, the explicit direction for this demo became: prioritize a convincing, complete Creative Direction / UI-UX demo over asset purism — use licensed stock freely everywhere needed (Mixkit, Pexels, Pixabay, Unsplash or equivalent), show the full 6-destination Explorer as designed, and keep Demo vs Production assets clearly separated in documentation so a later swap to real Minh Việt photography is trivial.

## Production Assets (real Minh Việt-owned, no action needed)

| Path | Used for |
|---|---|
| `public/images/hero/ha-long-bay.jpg` + `public/videos/hero/ha-long-bay.mp4` | Destination Explorer "Hạ Long" |
| `public/images/hero/sapa-terraces.jpg` | Destination Explorer "Sa Pa" |
| `public/images/hero/ninh-binh.jpg` | Combo card thumbnail "Combo Nhóm Bạn Ninh Bình" |

## Demo Assets (licensed stock — for this demo only)

All images are from **Pexels** (Pexels License — free for commercial use, no attribution required: https://www.pexels.com/license/). The hero video is from **Mixkit** (Mixkit Stock Video Free License — free for commercial use, no attribution required). All were chosen to avoid the Design DNA's banned clichés (no camera-facing poses, no "person raising hands on beach") and, where a specific place is named, to be geographically honest (a "Phú Quốc" photo is a real photo of Phú Quốc, not a generic beach).

### Hero video

| Path | Source | Used for |
|---|---|---|
| `public/videos/hero/combo-hero-preview.mp4` + `public/images/hero/combo-hero-preview.jpg` (poster) | Mixkit — ["Flying over a beautiful tropical landscape"](https://mixkit.co/free-stock-video/flying-over-a-beautiful-tropical-landscape-5369/) | Hero background video + fallback image |

Re-encoded locally (H.264, CRF 30, audio stripped since the element is always muted) from ~4.3MB down to ~1.6MB.

### Destination Explorer (Section 03) — 4 of 6 destinations

| Path | Photo ID | Destination |
|---|---|---|
| `public/images/combo/phu-quoc.jpg` | 4603354 | Phú Quốc |
| `public/images/combo/da-nang.jpg` | 33928629 | Đà Nẵng |
| `public/images/combo/nha-trang.jpg` | 32856428 | Nha Trang |
| `public/images/combo/cat-ba.jpg` | 24701013 | Cát Bà |

### Combo card thumbnails — each card uses an image distinct from Destination Explorer's, so no two cards/sections repeat the same file

| Path | Photo ID | Combo |
|---|---|---|
| `public/images/combo/ha-long-sunset.jpg` | 37634257 | Combo Trăng Mật Hạ Long |
| `public/images/combo/ha-long-cruise.jpg` | 14593292 | Combo Team Building Doanh Nghiệp — Hạ Long |
| `public/images/combo/sapa-homestay.jpg` | 34531652 | Combo Gia Đình Sa Pa |
| `public/images/combo/sapa-village.jpg` | 9972155 | Combo Sa Pa Mùa Lúa Chín (draft) |
| `public/images/combo/phu-quoc-sunset.jpg` | 3051551 | Combo Nghỉ Dưỡng Phú Quốc |
| `public/images/combo/da-nang-dragon-bridge.jpg` | 2162442 | Combo Gia Đình Đà Nẵng — Hội An |
| `public/images/combo/nha-trang-boat.jpg` | 27352559 | Combo Nhóm Bạn Nha Trang |
| `public/images/combo/cat-ba-kayak.jpg` | 5531629 | Combo Cát Bà — Lan Hạ Bay |

### Category tiles (Section 02)

| Path | Photo ID | Category |
|---|---|---|
| `public/images/combo/gia-dinh.jpg` | 3155726 | Gia đình |
| `public/images/combo/cap-doi.jpg` | 29340728 | Cặp đôi |
| `public/images/combo/nghi-duong.jpg` | 35236021 | Nghỉ dưỡng |
| `public/images/combo/doanh-nghiep.jpg` | 6950031 | Doanh nghiệp |
| `public/images/combo/nhom-ban.jpg` | 7625042 | Nhóm bạn |
| `public/images/combo/khach-cong-tac.jpg` | 28927716 | Khách công tác |

### Why-Combo editorial images (Section 04) — 3 distinct images, none reused from category tiles

| Path | Photo ID | Used for |
|---|---|---|
| `public/images/combo/trip-planning.jpg` | 5302804 | "Chuẩn bị trọn vẹn, không bỏ sót điều gì" |
| `public/images/combo/resort-breakfast.jpg` | 34645101 | "Một mức giá, trọn hành trình" |
| `public/images/combo/hotel-reception.jpg` | 5378703 | "Đồng hành xuyên suốt chuyến đi" |

### Article thumbnails (Section 05)

| Path | Photo ID | Article |
|---|---|---|
| `public/images/combo/hotel-room.jpg` | 32021575 | "Chọn khách sạn nào cho Combo nghỉ dưỡng gia đình?" |
| `public/images/hero/ha-long-bay.jpg` | *(Production)* | "Du thuyền trong Combo Hạ Long: nên chọn hạng phòng nào?" |
| `public/images/combo/airplane-window.jpg` | 31204580 | "Vé máy bay trong Combo được tính như thế nào?" |
| `public/images/combo/nhom-ban.jpg` | *(shared with category tile)* | "Khi nào nên chọn Tour thiết kế riêng thay vì Combo có sẵn?" |

All images were re-encoded locally (resized to a max width of 1600px, JPEG quality tuned) — final files are 93KB–561KB each.

## Replacement checklist

When real Minh Việt photography/video becomes available for any of the above:
1. Add the new file(s) to `public/images/combo/` (or `public/videos/hero/` for video).
2. Update the corresponding `src`/`alt`/`width`/`height` in `lib/combo/combo-data-seed.ts` — that is the only file that needs to change.
3. Move the entry from "Demo Assets" to "Production Assets" in this document.
4. Re-run `pnpm build` and browser-verify per `COMBO-LANDING-HANDOVER.md` §Test Result.

No component reads an image path directly — every `<Image>`/`<video>` in `components/combo/*` receives its `src` as a prop sourced from `ComboLandingContent`, so this replacement is always a content change, never a code change.
