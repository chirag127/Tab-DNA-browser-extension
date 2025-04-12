Here’s a detailed **Product Requirements Document (PRD)** for the **Tab DNA** browser extension:

---

## **Product Requirements Document (PRD)**
### Product Name: **Tab DNA**
**Tagline:** *Visualize your browsing journey.*

---

### **Overview**
**Tab DNA** is a browser extension that visualizes the **click path** or **referral chain** that led a user to their current tab in the form of a **branch-like graph**. This helps users understand how they navigated across different sites and pages, offering insight into their browsing habits and decision-making patterns.

---

### **Goals**
- Help users **visualize their browsing journey** in real time.
- Enable **awareness and control** over tab behavior and distractions.
- Offer a **graphical tree view** of the click/referral trail.
- Allow users to **navigate backward** intelligently.

---

### **Core Features**
#### 1. **Real-Time Click Path Tracking**
- Track referrer URLs when a link is clicked that opens:
  - A new tab.
  - A navigation in the current tab.
- Use the browser history API and `document.referrer`.

#### 2. **Branch-Like Graph Visualization**
- Interactive UI to view tab lineage as a collapsible tree:
  - **Nodes** represent URLs or page titles.
  - **Branches** represent click navigation (source → destination).
- Hovering shows:
  - Full URL
  - Timestamp
  - Site favicon
- Clicking a node reopens that URL in a new tab.

#### 3. **Session-Based Timeline**
- Organize tab graphs by session.
- Show time spent on each node.
- Allow "session replay" mode (jump through steps sequentially).

#### 4. **Manual Link Nodes**
- If a page is opened via search or direct input, allow users to optionally link it to a known origin.

#### 5. **Export & Share**
- Export the tab journey graph as:
  - PNG or SVG image
  - JSON file (for debugging or research)

---

### **Nice-to-Have Features**
- **Distraction Alerts:** If a user jumps between unrelated nodes too fast (e.g., YouTube → Reddit → Twitter in 1 min), flag as a “context switch.”
- **Color-coded branches:** For different domains or attention focus.
- **AI Tagging:** Group related tabs under tags like “Work,” “Research,” “Shopping.”

---

### **Technical Requirements**
- **Browser APIs:**
  - `tabs` API
  - `history` API
  - `webNavigation` API
  - `storage.local` for session graph data

- **Tech Stack:**
  - **Frontend:** HTML, CSS (Tailwind), JS, D3.js or Cytoscape.js for graph
  - **Backend:** (Optional) For syncing across devices
  - **Storage:** Local first, with optional cloud sync

---

### **User Experience (UX) Flow**
1. User installs the extension.
2. The extension starts recording browsing paths.
3. User clicks the **Tab DNA icon** in the browser toolbar.
4. A popup opens showing:
   - Current tab
   - Graph of its ancestry
   - Related sibling tabs
5. User can explore or export the graph.

---

### **Privacy Considerations**
- All browsing data is **stored locally** unless user enables sync.
- No third-party sharing of URLs or session graphs.
- Users can delete session history at any time.

---

### **Milestones**
| Phase | Deliverables |
|-------|--------------|
| **Phase 1** | Core graph, referrer tracking, visualization |
| **Phase 2** | Session timeline, export options |
| **Phase 3** | Distraction alerts, AI tagging, cross-device sync |

---

### **Success Metrics**
- **Engagement:** % of users viewing their tab graph daily
- **Insight generation:** Avg. nodes/branches per session
- **User retention:** Return users after 7 days
- **Feedback score:** Qualitative feedback on usefulness/UX
