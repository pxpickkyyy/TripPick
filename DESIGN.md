# DESIGN.md — TripPick Design System
## Catppuccin Mocha · Awwwards Site-of-the-Day Editorial & Spatial Architecture

### 1. Design Philosophy & Aesthetic Direction
TripPick rejects generic AI dark-mode tropes (neon cyan `#00F2FE` on pitch black `#020205`, fake sci-fi telemetry tickers, and mock CLI prompts) in favor of an **Awwwards Site-of-the-Day ($10,000+ bespoke agency)** editorial and spatial product experience built strictly on the **Catppuccin Mocha** palette.

- **Aesthetic Persona**: Bespoke Hospitality Editorial meets Tactile Spatial Hardware (`Doppelrand` / Double-Bezel architecture, editorial serif accents, real architectural photography, and spring-physics consensus cards).
- **Brand Inspirations**: Awwwards Site-of-the-Day winners (Locomotive, Studio Freight, Resn, Linear, Aman Resorts editorial).

---

### 2. Authentic Catppuccin Mocha Color Tokens

| Role | Token | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Crust** | `--ctp-crust` | `#11111b` | Deep outer bezel trays, recessed input wells, modal backdrops |
| **Mantle** | `--ctp-mantle` | `#181825` | Secondary architectural shells, outer double-bezel frames |
| **Base** | `--ctp-base` | `#1e1e2e` | Primary viewport canvas & inner card core surfaces |
| **Surface 0** | `--ctp-surface0` | `#313244` | Hairline 1px structural borders & elevated interactive pills |
| **Surface 1** | `--ctp-surface1` | `#45475a` | Hover borders, active divider hairlines |
| **Surface 2** | `--ctp-surface2` | `#585b70` | High-emphasis specular borders |
| **Overlay 0** | `--ctp-overlay0` | `#6c7086` | Muted metadata labels, disabled states |
| **Subtext 0** | `--ctp-subtext0` | `#a6adc8` | Captions, secondary editorial annotations |
| **Subtext 1** | `--ctp-subtext1` | `#bac2de` | Body copy, executive summaries |
| **Text** | `--ctp-text` | `#cdd6f4` | Primary display headlines & high-contrast data |
| **Mauve** | `--ctp-mauve` | `#cba6f7` | Primary signature accent, interactive focus rings, primary CTAs |
| **Lavender** | `--ctp-lavender` | `#b4befe` | Secondary spatial accent, hover highlights |
| **Peach** | `--ctp-peach` | `#fab387` | Warm editorial highlight, hospitality ratings, gradient pair |
| **Green** | `--ctp-green` | `#a6e3a1` | Unanimous consensus verified, escrow locked, statutory compliance |
| **Sapphire** | `--ctp-sapphire` | `#74c7ec` | Spatial coordinates, verified WiFi/hardware badges |
| **Red** | `--ctp-red` | `#f38ba8` | Pass action, budget ceiling alert |
| **Rosewater** | `--ctp-rosewater` | `#f5e0dc` | Warm specular ambient light & italic serif accents |

---

### 3. Editorial & Technical Typography Scale

- **Editorial Serif (`--font-editorial`)**: `'Instrument Serif', Georgia, serif`
  - Used for italic luxury contrast words inside hero & section headers (`font-editorial italic font-normal text-[#f5e0dc]`).
- **Architectural Display (`--font-display`)**: `'Syne', 'Prompt', sans-serif`
  - Hero Headline: `clamp(2.5rem, 4.8vw + 0.75rem, 4.65rem)`, `line-height: 0.96`, `letter-spacing: -0.035em`.
- **UI & Bilingual Thai/English Body (`--font-sans`)**: `'Plus Jakarta Sans', 'Prompt', sans-serif`
  - Clean, high-legibility geometric humanist sans paired with native Thai `'Prompt'` metrics.
- **Financial & Statutory Figures (`--font-mono`)**: `'JetBrains Mono', monospace`
  - Strictly `font-variant-numeric: tabular-nums` (`tabular-data`) for Thai statutory tax (`ท.ป. 4/2528`), 7% VAT, 3% WHT, and PromptPay EMVCo references.

---

### 4. Tactile Hardware & Spatial Architecture (`Doppelrand` Double-Bezel)

1. **Double-Bezel Nested Shells (`.double-bezel-shell` + `.double-bezel-core`)**:
   - Outer tray: `bg-[#181825]/90 border border-[#313244] p-1.5 rounded-[2rem]`
   - Inner core: `bg-[#1e1e2e]/95 border border-[#45475a]/45 rounded-[calc(2rem-6px)] shadow-[inset_0_1px_0_rgba(205,214,244,0.08)]`
2. **Button-in-Button CTA Architecture**:
   - Pill/rounded-2xl primary button in `#cba6f7` -> `#fab387` with an embedded `#11111b`/15 circular/rounded icon housing that translates `translate-x-0.5 -translate-y-0.5` on hover.
3. **Interactive Venue Showcase & Asymmetric Bento Grid**:
   - Real curated photography from `CURATED_DESTINATIONS` with live destination switching on the hero stage, paired with a 12-column asymmetric Bento architecture showcasing stakeholder harmony, radial quorum rings, 4-stage retreat timeline, and statutory Thai tax (`ท.ป. 4/2528`) + PromptPay EMVCo escrow.
