# คำนวณเงินสะสม — Current Implementation Handoff

> **Purpose**: This document gives a complete picture of the existing *contribution-accumulation* (คำนวณเงินสะสม) feature so that an AI agent (or developer) can implement a new or extended version without re-reading the full codebase.

---

## 1. Where It Lives

| Concern | File |
|---|---|
| Main survey page (all UI + logic) | `src/app/page.tsx` |
| Contribution visualizer sub-render | `renderContributionVisualizer()` inside `page.tsx` |
| User-input step render | `renderUserInputSection()` inside `page.tsx` |
| Stepper definition | bottom of `page.tsx` (`steps` array + `renderStepper()`) |
| Types | local interfaces in `page.tsx` (not from `src/types/index.ts`) |
| Feedback submit (sends collected data) | `src/services/feedbackService.ts` → `POST /api/feedback` |
| MongoDB model | `src/models/UserFeedback.ts` |

---

## 2. Full Survey Step Flow

The app is a **single-page, state-driven multi-step** flow. There are no URL changes. Navigation is controlled by:

```ts
const [currentSection, setCurrentSection] = useState<Section>("home");

const navigateTo = (section: Section) => {
  setCurrentSection(section);
  window.scrollTo(0, 0);
};
```

### Step sequence (normal registered user)

```
home  →  selection  →  [section40Options]  →  currentBenefits  →  userInput  →  suggestBenefits  →  end
```

- `section40Options` is only inserted when the user picks มาตรา 40 in `selection`.
- If the user picks "ยังไม่ได้เข้าร่วม" (notRegYet), they skip directly to `suggestBenefits` (no `currentBenefits` or `userInput`).

### The stepper (progress indicator shown on screen)

```ts
const steps = selectedSection === "notRegYet"
  ? [
      { id: 1, label: "เลือกมาตรา",   sections: ["selection"] },
      { id: 2, label: "ร่วมเสนอแนะ", sections: ["suggestBenefits"] },
    ]
  : [
      { id: 1, label: "เลือกมาตรา",      sections: ["selection", "section40Options"] },
      { id: 2, label: "สิทธิประโยชน์",   sections: ["currentBenefits"] },
      { id: 3, label: "คำนวณเงินสะสม",  sections: ["userInput"] },   // ← THIS STEP
      { id: 4, label: "ร่วมเสนอแนะ",    sections: ["suggestBenefits"] },
    ];
```

**Step 3 "คำนวณเงินสะสม"** maps to `currentSection === "userInput"`.

---

## 3. Section Types (User Classification)

```ts
type SectionType =
  | "33"       // ลูกจ้าง / พนักงานเอกชน (mandatory)
  | "39"       // อดีตมาตรา 33 สมัครใจต่อ (voluntary continuation)
  | "40"       // อาชีพอิสระ — intermediate state before sub-option chosen
  | "40-1"     // มาตรา 40 ทางเลือก 1 — 70 บาท/เดือน
  | "40-2"     // มาตรา 40 ทางเลือก 2 — 100 บาท/เดือน
  | "40-3"     // มาตรา 40 ทางเลือก 3 — 300 บาท/เดือน
  | "notRegYet"
  | null;
```

The flow sets `selectedSection` at the `selection` screen (and at the `section40Options` screen for the 40-x sub-types). The `userInput` step branches all its form fields based on `selectedSection`.

---

## 4. State Variables Relevant to the Calculation Step

All state lives in the `Home()` component (no separate context/store):

```ts
// Which social security section the user belongs to
const [selectedSection, setSelectedSection] = useState<SectionType>(null);

// Collects demographic + contribution data
const [userData, setUserData] = useState<UserData>({
  name:               "",
  age:                "",
  occupation:         "",
  yearsContributing:  "",   // used by 33, 40-x
  monthsContributing: "",   // used by 33, 40-x (optional extra months)
  monthlyContribution:"",   // used by 33; for 40-x it holds the chosen radio value
  usedBenefits:       [],

  // Extra fields only used when selectedSection === "39"
  yearsSection33:     "",
  monthsSection33:    "",
  monthlySection33:   "",   // user-entered contribution amount during their 33 period
  yearsSection39:     "",
  monthsSection39:    "",
  // monthlyContribution is not used for 39 (fixed at 432 baht)
});
```

`updateUserData(newData: Partial<UserData>)` merges the partial into state.

---

## 5. The `userInput` Step — Form Fields (renderUserInputSection)

### 5a. Fields common to ALL section types (except notRegYet)

```
อายุ        — number input  → userData.age
อาชีพ      — text input    → userData.occupation
```

### 5b. Fields that branch by `selectedSection`

#### มาตรา 33

```
ระยะเวลาที่จ่ายเงินเข้าประกันสังคม:
  ├── จำนวนปี    (number) → userData.yearsContributing
  └── จำนวนเดือน (number) → userData.monthsContributing   (optional, 0 = none)

monthlyContribution is seeded with "750" as the default (for salary >15,000 ฿)
but is NOT shown as an editable field on screen — the user does not change it here.
```

#### มาตรา 39

```
ระยะเวลาที่จ่ายในมาตรา 33:
  ├── จำนวนปี    (number)  → userData.yearsSection33
  ├── จำนวนเดือน (number)  → userData.monthsSection33
  └── จำนวนเงินต่อเดือน   → userData.monthlySection33  (user types their 33-period contribution)

ระยะเวลาที่จ่ายในมาตรา 39:
  ├── จำนวนปี    (number)  → userData.yearsSection39
  ├── จำนวนเดือน (number)  → userData.monthsSection39
  └── อัตราตายตัว 432 บาท/เดือน  (read-only display, not editable)
```

#### มาตรา 40 / 40-1 / 40-2 / 40-3

```
ระยะเวลาที่จ่ายเงินสมทบในมาตรา 40:
  ├── จำนวนปี    (number) → userData.yearsContributing
  └── จำนวนเดือน (number) → userData.monthsContributing

ทางเลือกที่คุณใช้ในมาตรา 40 (RadioGroup):
  ├── "70"  → ทางเลือกที่ 1 — ประสบอันตราย/เจ็บป่วย, ทุพพลภาพ, ตาย
  ├── "100" → ทางเลือกที่ 2 — ทั้งหมดจากทางเลือกที่ 1 + บำเหน็จชราภาพ  (DEFAULT)
  └── "300" → ทางเลือกที่ 3 — ทั้งหมดจากทางเลือกที่ 2 + สงเคราะห์บุตร
  
  Selected value stored in → userData.monthlyContribution
```

> **Note**: Even though the user may have already selected 40-1/40-2/40-3 on the previous screen, the `userInput` step still shows the radio group so the user can confirm or change the sub-option. The `selectedSection` state is **not** updated by the radio; only `userData.monthlyContribution` changes.

---

## 6. Default Contribution Amounts (Auto-seeded via useEffect)

```ts
const getDefaultContribution = () => {
  if (selectedSection === "33")  return "750";   // assumes salary > 15,000 ฿
  if (selectedSection === "39")  return "432";   // fixed statutory rate
  if (selectedSection === "40")  return "100";   // middle option (ทางเลือก 2)
  return "";
};

useEffect(() => {
  if (!userData.monthlyContribution && selectedSection) {
    updateUserData({ monthlyContribution: getDefaultContribution() });
  }
}, [selectedSection, userData.monthlyContribution]);
```

---

## 7. Contribution Visualizer — Full Calculation Logic (`renderContributionVisualizer`)

This component is rendered **inside** the `userInput` form, between the form fields and the navigation buttons. It renders in-place as the user types (reactive).

### Return condition

```ts
if (totalSum === 0) return null;
```
The visualizer only appears once at least one non-zero value is entered.

---

### 7a. Case: selectedSection === "39" (dual-period)

```ts
const years33   = parseFloat(userData.yearsSection33   || "0") || 0;
const months33  = parseFloat(userData.monthsSection33  || "0") || 0;
const monthly33 = parseFloat(userData.monthlySection33 || "0") || 0;
const years39   = parseFloat(userData.yearsSection39   || "0") || 0;
const months39  = parseFloat(userData.monthsSection39  || "0") || 0;
const monthly39 = 432;   // hard-coded, not from userData

const tMonths33 = years33 * 12 + months33;
const tMonths39 = years39 * 12 + months39;
const total33   = tMonths33 * monthly33;
const total39   = tMonths39 * monthly39;
totalSum        = total33 + total39;

// breakdown array built if total33 > 0 and/or total39 > 0:
breakdown = [
  { label: `มาตรา 33 (${years33} ปี ...)`, value: total33, color: "#3D3A7E" },
  { label: `มาตรา 39 (${years39} ปี ...)`, value: total39, color: "#e0c927" },
];
```

### 7b. Case: all other registered sections (33, 40, 40-1, 40-2, 40-3)

```ts
const years   = parseFloat(userData.yearsContributing  || "0") || 0;
const months  = parseFloat(userData.monthsContributing || "0") || 0;
const monthly = parseFloat(userData.monthlyContribution || "0") || 0;
const tMonths = years * 12 + months;
totalSum      = tMonths * monthly;

// sectionName is a Thai label derived from selectedSection
// labelColor: "#3D3A7E" for 33, "#f3762a" for 40-x
breakdown = [
  { label: `${sectionName} (${years} ปี ...)`, value: totalSum, color: labelColor },
];
```

> **Important caveat shown to users**:  
> "คำนวณประมาณการสะสมจากจำนวนปีและอัตราส่งต่อเดือนที่คุณระบุ ตัวเลขนี้ไม่รวมผลประโยชน์ตอบแทนรายปี ดอกผลสะสม และเงินช่วยเหลือสมทบเพิ่มเติมจากนายจ้างหรือรัฐบาล"

---

### 7c. Visual output rendered by the visualizer

1. **Summary headline** — `{totalSum.toLocaleString("th-TH")} บาท` (large text)
2. **Horizontal stacked bar chart** — proportional width segments, one per breakdown entry, with Chakra `<Tooltip>` showing label + baht amount on hover
3. **Legend grid** — one card per breakdown entry showing: colored dot, label, baht amount, percentage
4. **Disclaimer note** (see above)

The bar uses:

```tsx
<Box h="4" w="full" bg="gray.100" borderRadius="full" overflow="hidden" display="flex">
  {breakdown.map((item, idx) => (
    <Tooltip key={idx} label={`${item.label}: ${item.value.toLocaleString("th-TH")} บาท`} hasArrow>
      <Box w={`${(item.value / totalSum) * 100}%`} h="full" bg={item.color} transition="width 1s ease" />
    </Tooltip>
  ))}
</Box>
```

---

## 8. What "คำนวณเงินสะสม" Data Is Eventually Saved

On submission (`handleSubmitFeedback`) the following is POSTed to `/api/feedback`:

```json
{
  "sectionType": "33" | "39" | "40-1" | "40-2" | "40-3" | "notRegYet",
  "userData": {
    "age": "...",
    "occupation": "...",
    "yearsContributing": "...",
    "monthsContributing": "...",
    "monthlyContribution": "...",
    "usedBenefits": ["...", "..."],
    // Section-39-only fields:
    "yearsSection33": "...",
    "monthsSection33": "...",
    "monthlySection33": "...",
    "yearsSection39": "...",
    "monthsSection39": "..."
  },
  "suggestedBenefits": {
    "healthcare": true|false,
    "retirement": true|false,
    "unemployment": true|false,
    "disability": true|false,
    "childSupport": true|false,
    "other": "free-text"
  }
}
```

The **calculated total (`totalSum`) is NOT stored** — only the raw input parameters are. Any recalculation must be done from the raw fields.

---

## 9. MongoDB Schema (UserFeedback model)

```ts
// src/models/UserFeedback.ts
const UserFeedbackSchema = new Schema<IUserFeedback>({
  sectionType: { type: String, enum: ["33","39","40","40-1","40-2","40-3","notRegYet"], default: "notRegYet" },
  userData: {
    name:               String,
    age:                String,
    occupation:         String,
    yearsContributing:  String,
    monthsContributing: String,
    monthlyContribution:String,
    usedBenefits:       [String],
    yearsSection33:     String,
    monthsSection33:    String,
    monthlySection33:   String,
    yearsSection39:     String,
    monthsSection39:    String,
  },
  suggestedBenefits: {
    healthcare:  Boolean,
    retirement:  Boolean,
    unemployment:Boolean,
    disability:  Boolean,
    childSupport:Boolean,
    other:       String,
  },
  createdAt: { type: Date, default: Date.now },
});
```

> **Note**: `userIdea` (free-text textarea in the UI) is captured in the `suggestedBenefits.other` field per the service layer mapping.

---

## 10. Known Limitations / Design Notes

| # | Issue | Detail |
|---|---|---|
| 1 | **Employer contribution excluded** | For มาตรา 33, employer matches 5% and the government adds 2.75%. The visualizer only reflects the employee share (5% capped contribution). |
| 2 | **Section 33 monthly amount not collected** | `monthlyContribution` is defaulted to `"750"` (assumes ≥15,000 ฿ salary) but is not shown as an editable field. Real contribution is 5% of actual salary. |
| 3 | **No interest/growth calculation** | The tool is purely `months × monthly_rate` — no compounding, no SSO return rate. |
| 4 | **มาตรา 40 sub-option mismatch possible** | User may have selected 40-2 on the previous screen but then change the radio in `userInput` to 70 (ทางเลือก 1). `selectedSection` remains "40-2" but `userData.monthlyContribution` becomes "70". |
| 5 | **`userIdea` field not in schema** | The `userIdea` Textarea in `suggestBenefits` calls `updateSuggestedBenefits("userIdea", ...)` but the Mongoose schema has no `userIdea` field — it will be silently dropped by Mongoose. |
| 6 | **`lib/mongodb.ts` unused** | The native `MongoClient` singleton in `src/lib/mongodb.ts` is never imported by any route; all DB access goes through Mongoose in the API routes directly. |

---

## 11. Framer Motion Integration

The `userInput` section itself is **not** individually animated, but section transitions are wrapped at the top level:

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentSection}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.35, ease: "easeInOut" }}
  >
    {renderSection()}
  </motion.div>
</AnimatePresence>
```

`framer-motion` v12 is installed (`"framer-motion": "^12.5.0"`). The `staggerContainer` / `staggerItem` motion variants are only used in `renderSelectionSection` and `renderSection40OptionsSection`.

---

## 12. Theme Tokens Used by the Visualizer

```
primary.500  = #3D3A7E   (purple — used for มาตรา 33 bar segment and label)
accent.500   = #f3762a   (orange — used for มาตรา 40-x bar segment)
#e0c927                  (yellow — used for มาตรา 39 bar segment, not a Chakra token)
gray.100     = bar track background
gray.50      = legend card background
```

Chakra theme file: `src/theme/index.ts` (the one actually loaded). `src/theme/theme.ts` is an unused older file.

---

## 13. Quick Reference: Calculation Formulas

```
มาตรา 33:
  total = (yearsContributing × 12 + monthsContributing) × 750*
  * 750 is the seeded default; actual = 5% of salary (max 15,000 ฿/mo → max 750 ฿/mo employee share)

มาตรา 39:
  total = [(yearsSection33 × 12 + monthsSection33) × monthlySection33]
        + [(yearsSection39 × 12 + monthsSection39) × 432]

มาตรา 40-1:
  total = (yearsContributing × 12 + monthsContributing) × 70

มาตรา 40-2:
  total = (yearsContributing × 12 + monthsContributing) × 100

มาตรา 40-3:
  total = (yearsContributing × 12 + monthsContributing) × 300
  (But radio in UI allows user to change monthly value from any of 70/100/300)
```

---

*Last verified against source: `src/app/page.tsx` (1888 lines, branch: main, date: 2026-06-10)*
