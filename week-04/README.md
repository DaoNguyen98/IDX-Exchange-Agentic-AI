\# Week 04 — Conversational Property Search Agent



\## Overview



Week 04 extends the Week 03 property search into a multi-turn conversational experience.



The agent can ask follow-up questions, remember user preferences during the session, and refine the property search step by step.



\## Example Conversation



```text

User: Find homes in Irvine

Agent: What is your budget?



User: Under $1.2M

Agent: Any preferences — condo, townhome, single family, or land?



User: I want a condo

Agent: How many bedrooms do you need?



User: 3 bedrooms

Agent: \[returns matching properties]



\## Session Memory

The agent remembers search preferences such as:

\- City

\- Minimum price

\- Maximum price

\- Bedrooms

\- Bathrooms

\- Property type

\- Pool

\- View

\- HOA limit

\- Previous results

Session data is managed with:

getSession(userId)

updateSession(userId, updates)

clearSession(userId)



Week 04 Flow

User Message

&#x20;   ↓

Week 02 Parser

&#x20;   ↓

Session Memory

&#x20;   ↓

Follow-up Question

&#x20;   ↓

Week 03 Property Search

&#x20;   ↓

MySQL rets\_property

&#x20;   ↓

Formatted Property Results





What I Learned

In Week 04, I learned how to turn a single-turn property search into a multi-turn conversational agent.



The agent can remember previous answers, ask for missing information, refine search preferences, and query the MySQL property database when enough information is available.

