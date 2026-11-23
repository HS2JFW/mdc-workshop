# Domain Glossary (พจนานุกรมคำศัพท์ระบบและโดเมน)

This glossary defines ubiquitous domain vocabulary for the **Moral Center Hackathon & Project Management System (MDC Workshop)**.
All engineering skills (`tdd`, `codebase-design`, `domain-modeling`, `to-spec`, `code-review`) must consult and align with these definitions.

---

## 1. องค์กรและขอบเขตหลัก (Core Organization & Scope)

- **MDC / ศูนย์คุณธรรม (องค์การมหาชน)**: Moral Promotion Center (Public Organization), Ministry of Culture, Thailand.
- **Regional Hackathon / แฮกกาธอน 4 ภูมิภาค**: The 4-region moral innovation workshop and competition involving 4 pilot provinces:
  - **อยุธยา (Ayutthaya)**: Central Region (ภาคกลาง)
  - **ระยอง (Rayong)**: Eastern Region (ภาคตะวันออก)
  - **กาฬสินธุ์ / อุดรธานี (Kalasin / Udon Thani)**: Northeastern Region (ภาคตะวันออกเฉียงเหนือ)
  - **สุราษฎร์ธานี / พังงา (Surat Thani / Phang Nga)**: Southern Region (ภาคใต้)
  - **ลำปาง / น่าน (Lampang / Nan)**: Northern Region (ภาคเหนือ)

---

## 2. คุณธรรมหลัก 5 ประการ (5 Core Moral Virtues)

Every project, scoring rubric, and AI evaluation is grounded in the 5 moral standard dimensions:
1. **พอเพียง (Sufficiency)**: Living sustainably, economic resilience, anti-waste, moderation.
2. **มีวินัยรับผิดชอบ (Discipline & Responsibility)**: Respecting community rules, traffic safety, civic duty, integrity in public tasks.
3. **สุจริต (Honesty & Transparency)**: Anti-corruption, fair governance, transparency, trustworthiness.
4. **จิตอาสา (Volunteer Spirit & Public Mindedness)**: Community service, mutual aid, disaster relief, selfless contribution.
5. **กตัญญู (Gratitude)**: Caring for family, elderly, local heritage, and cultural roots.

---

## 3. ระดับบทบาทผู้เข้าร่วม 3 ระดับ (3 Participant Levels)

- **นโยบาย (`policy`)**: Policy makers, provincial governors, agency executives, local government heads.
- **ผู้ปฏิบัติการ (`practitioner`)**: Field officers, teachers, social workers, community leaders.
- **ประชาชน (`citizen`)**: Citizens, youth, local business owners, grassroots networks.

*Rule:* Each Hackathon Coffee Group must ideally balance energy across all 3 levels (e.g. 2 policy • 4 practitioner • 6 citizen).

---

## 4. กลุ่มกาแฟสร้างสรรค์คุณธรรม (Coffee Groups Pool)

Dynamic teams into which participants organize themselves for the Hackathon:
- **5 Default Groups**:
  - `mocha` (กลุ่มมอคค่า): Warm brown / Chocolate
  - `cappuccino` (กลุ่มคาปูชิโน): Amber / Foamy
  - `americano` (กลุ่มอเมริกาโน): Dark / Bold
  - `espresso` (กลุ่มเอสเพรสโซ): Deep roasted brown
  - `latte` (กลุ่มลาเต้): Creamy caramel
- **Custom Groups**: Groups dynamically created by Admins, persisted in the SQLite table `pilot_coffee_groups`, synchronized to all concurrent users in real time.

---

## 5. ระบบปัญญาประดิษฐ์และโครงสร้างพื้นฐาน (AI Engine & Infrastructure)

- **OpenRouter Multi-Key Pool**: Round-robin load balancer supporting comma/newline-separated API keys, providing linear throughput scaling ($N \times \text{RPM}$), 60-second cooldown on HTTP 429, random jitter failover, and a 45-second timeout window.
- **Universal Rubric (4 Dimensions, 100 Points)**:
  1. ความสอดคล้องกับคุณธรรมเป้าหมาย (Relevance to Moral Virtues - 25 pts)
  2. การแก้ปัญหาเชิงพฤติกรรมในพื้นที่ (Behavioral Impact & Feasibility - 25 pts)
  3. นวัตกรรมและความคิดสร้างสรรค์ (Innovation & Creativity - 25 pts)
  4. การผสานพลัง 3 ระดับและความยั่งยืน (3-Level Synergy & Sustainability - 25 pts)
- **SQLite Engine**: Node.js built-in `node:sqlite` (`DatabaseSync`) with WAL mode in `data/pilot_activities_4regions.sqlite`.
- **PMS**: Project Management System for strategic plans, KPIs, decision directives, and meeting reports.
- **Coolify**: Self-hosted PaaS host managing containerized production builds and deployments (`https://workshop.addpay.in.th`).
