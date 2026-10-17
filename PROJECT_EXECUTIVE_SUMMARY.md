# MAALHUB — EXECUTIVE PROJECT SUMMARY
**JANIC 2026 Pre-Evaluation Document | Jazeera University**
**Faculty of Computer Science & Information Technology**

---

### 1. General Information
* **Project Title:** MaalHub (Empowering Innovation & Capital)
* **Tagline:** Connecting Ideas With Opportunities
* **Project Type:** Software / Full-Stack Web Application
* **Team Members:**
  1. **Abdinajiib Artan Osman** (Full-Stack Architecture & Backend Lead)
  2. **Sumaya Anwar Mumin** (Frontend Engineering & UI/UX Lead)
* **Faculty / Department:** Faculty of Computer Science and Information Technology, Jazeera University
* **Supervisor:** *[Supervisor Name]*

---

### 2. The Problem
Early-stage entrepreneurs, innovators, and university graduates in developing ecosystems face severe barriers in securing seed capital and business partners. Traditional financial institutions (commercial banks) require substantial physical collateral, extensive credit histories, and personal guarantees that young innovators cannot provide. Simultaneously, local and diaspora investors possess capital but lack a transparent, vetted, and trustworthy digital platform to discover high-potential domestic ventures and ensure accountability for how their investments are deployed.

---

### 3. The Solution
**MaalHub** is an intelligent web-based investment and venture discovery platform that democratizes access to seed capital. It directly bridges the gap between ambitious startup founders and capital providers. By introducing structured, milestone-based investment phases, verified project portfolios, and integrated direct messaging, MaalHub removes informal gatekeepers and creates a transparent environment for early-stage business funding.

---

### 4. Target Beneficiaries & Users
1. **Entrepreneurs & Innovators:** Students, recent graduates, and small business founders seeking seed investment and strategic partners.
2. **Investors & Angels:** Local business leaders, syndicates, and diaspora investors looking for vetted opportunities across high-growth domestic sectors.
3. **Universities & Incubators:** Academic institutions seeking to commercialize student graduation research and capstone innovations.

---

### 5. Key Objectives & Main Features
* **Milestone-Based Investment Tranches:** Funding targets are broken into verifiable development milestones (`project_investment_phases`) with proof-of-work documentation, ensuring accountability before subsequent capital is unlocked.
* **Sector-Specific Discovery:** Specialized filtering across four high-impact local sectors: **Agriculture, Business, Hospitality & Tourism, and Education**.
* **Direct Deal Proposals & In-App Messaging:** Formal proposal submission with status tracking (`Pending`, `Accepted`, `Rejected`, `Withdrawn`) coupled with direct, encrypted in-app dialogue.
* **Role-Specific Dashboards:** Custom analytics, project trackers, and proposal management for both entrepreneurs and investors.
* **Super Admin Governance:** Platform moderation center for identity verification, project vetting, and ecosystem trust.

---

### 6. Technical Architecture & Security
* **Frontend:** React (Vite), Tailwind CSS, Lucide React, React Router 6.
* **Backend:** Node.js, Express 5, Morgan, Helmet, CORS, express-rate-limit, Zod data validation.
* **Database & Cloud Storage:** Supabase (PostgreSQL) with table-level **Row Level Security (RLS)** policies ensuring multi-tenant data privacy, and Supabase Storage for secure assets.

---

### 7. Practical Impact
* **Economic Growth:** Facilitates capital inflow into vital real-economy sectors like food production, education, and local commerce.
* **Youth Empowerment:** Provides university graduates with a viable pathway from academic capstone projects to funded commercial enterprises.
* **Transparency:** Replaces opaque, high-risk informal lending with documented, milestone-governed partnerships.
