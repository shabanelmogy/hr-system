# Discovery question bank

Pick what fits the topic and the owner. Never read the list aloud. Adapt the wording, give a
proposed default where you can, and ask for a real example.

## 1. Problem and goals

- What problem are we solving, and who feels it most?
- How is it done today (tools, paper, spreadsheets, another system)? What breaks?
- What must be true in six months for this to be a success? How will we measure it?
- What is the smallest first release that would already be useful?
- What is explicitly **not** part of this project?

## 2. Organization and tenancy

- Will one organization use the system, or many independent ones (branches, schools, clients)?
- Can a person belong to more than one organization? With different roles in each?
- Do organizations share any data (catalogs, price lists, users)?
- Who creates a new organization, and who is its first administrator?
- Is there a subscription, plan, or feature limit per organization?

## 3. Actors

- Who uses the system? For each: goal, frequency, device, location, number of users.
- Are there external systems or automated actors (payment gateway, government API, scheduler)?
- Who administers users and permissions? Who approves sensitive actions?
- Are any users minors, patients, or other protected groups?

## 4. Workflows

- Walk me through the last real case from start to finish.
- What starts this process? What is the final state?
- What can go wrong at each step? What happens then?
- Can it be cancelled, reversed, or corrected? By whom, until when?
- What happens if two people do this at the same time?
- Are there approvals? How many levels? What if the approver is absent?
- Are there deadlines, reminders, or escalations?

## 5. Business objects and rules

- What are the main "things" the business manages? What identifies each one uniquely?
- What must always be true about it? (limits, required relationships, uniqueness)
- Which values are calculated? From what? Rounded how?
- Which states can it be in, and what moves it between states?
- Can it be deleted? What happens to history that refers to it?
- Which rules differ per organization (configurable) vs fixed for everyone?

## 6. Access and privacy

- Who can see which records? (all, own, own team, own branch, assigned only)
- Who can change or delete them? Are there fields only some roles can edit?
- Which data is sensitive (personal, financial, health)? Who may export it?
- Must we log who changed what and when? For how long?

## 7. Reporting

- Which decisions are made from this data? Which reports or dashboards support them?
- How fresh must the numbers be (real time, hourly, daily)?
- Any exports (Excel, PDF) or official documents?

## 8. Integrations and notifications

- Which systems must we exchange data with? Direction, frequency, format?
- What must happen when an integration is down?
- Which events notify someone? By which channel (email, SMS, WhatsApp, in-app)?

## 9. Money (when relevant)

- Currencies, taxes, rounding rules, discounts, refunds, partial payments?
- Who can issue or cancel a financial document? Is numbering sequential/legal?
- Which accounting system receives the result?

## 10. Quality attributes

- How many users at the same time at peak? How much data per year?
- Acceptable downtime? Backup and recovery expectations?
- Languages and right-to-left? Time zones? Date/number formats?
- Hosting constraints (cloud, on-premises, data residency)?

## 11. Migration (existing data)

- Is there data to bring over? From where, how much, how clean?
- Can the old system be frozen during cutover? For how long?
- Which historical data is legally required to keep?

## Follow-up probes

- "Can you give me an example?"
- "What happens if that does not happen?"
- "Who decides that?"
- "Is that always true, or usually?"
- "How many / how often / how long?"
- "What would go wrong if we did not support this in the first release?"
