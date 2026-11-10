\# Week 7 — Recommendation Engine



\## Goal



Build a hybrid recommendation engine that combines structured property similarity with semantic embedding similarity.



Given a listing the user likes, the system returns the top 5 similar active listings and validates each recommendation using recent sold-property data from `california\_sold`.



\## Data Sources



\### Active Listings



Source: `rets\_property`



Important fields:



\- `L\_ListingID`

\- `L\_City`

\- `L\_SystemPrice`

\- `L\_Keyword2`

\- `LM\_Int2\_3`

\- `L\_Remarks`



\### Sold Comparables



Source: `california\_sold`



Used for price validation with:



\- City

\- Property type

\- Living area

\- Close price

\- Close date



\## Hybrid Recommendation Score



The recommendation score combines:



\- 60% structured similarity

\- 40% semantic similarity



Structured similarity considers:



\- Price difference

\- Bedroom count

\- City

\- Square footage



Semantic similarity uses cosine similarity between listing embeddings created in Week 6.



\## Comp Validation



Each recommended property is validated against recent sold properties.



The system:



1\. Finds residential sales in the same city.

2\. Uses properties between 80% and 120% of the listing's square footage.

3\. Uses sales from the last 6 months.

4\. Calculates average price per square foot.

5\. Estimates a comp-supported property price.

6\. Compares the listing price with the estimated comp price.



\## Example



Target listing:



\- Mountain House

\- $1,122,426

\- 5 bedrooms

\- 4 bathrooms

\- 2,992 sq ft



Top recommendation:



\- Mountain House

\- Hybrid score: 95.07

\- List price: $1,128,292

\- Estimated comp price: $1,060,018

\- 12 recent comps

\- Listed approximately 6.4% above recent comps



\## Run Recommendation Demo



```powershell

npx tsx week-07/src/recommendation-cli.ts 1118381441

```



\## Run Tests



Hybrid scoring test:



```powershell

npx tsx week-07/tests/hybrid-score.test.ts

```



Recommendation engine test:



```powershell

npx tsx week-07/tests/recommendation.test.ts

```



\## Files



```text

week-07/

├── README.md

├── src/

│   ├── hybrid-score.ts

│   ├── comp-validation.ts

│   ├── recommendation.ts

│   └── recommendation-cli.ts

└── tests/

&#x20;   ├── hybrid-score.test.ts

&#x20;   └── recommendation.test.ts

```



\## What I Learned



This week I learned how to combine structured property features with semantic embeddings to build a hybrid recommendation system.



I also learned how recent sold-property data can be used to validate recommendation prices instead of relying only on similarity scores.

