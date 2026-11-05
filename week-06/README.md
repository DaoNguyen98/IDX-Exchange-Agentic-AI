\# Week 6 — Embeddings \& Vector Search



\## Goal



Build a semantic property search feature that can understand a natural-language description and return the most similar active listings.



Unlike keyword search, semantic search compares the meaning of the user's query with listing descriptions.



Example:



```text

modern cabin with mountain views and cozy character

```



The system can still find relevant listings even when the exact words in the query do not appear in the listing description.



\## Data Source



This project uses the `rets\_property` table from the `idx\_exchange` MySQL database.



Important fields used:



\- `L\_ListingID`

\- `L\_City`

\- `L\_SystemPrice`

\- `L\_Remarks`

\- `L\_Type\_`

\- `L\_Keyword2`

\- `LM\_Dec\_3`

\- `LM\_Int2\_3`

\- `L\_Status`



Only active listings with non-empty remarks are used.



\## How It Works



1\. Load active listings from `rets\_property`.

2\. Combine important listing fields into one text description.

3\. Generate an embedding for each listing using Gemini `gemini-embedding-001`.

4\. Store the generated vectors in a local embedding index.

5\. Convert the user's search query into an embedding.

6\. Compare the query vector with listing vectors using cosine similarity.

7\. Sort listings by similarity score.

8\. Return the top 5 matches.



\## Why Embeddings



Structured filters are useful for exact requirements such as price, bedrooms, or city.



Embeddings are useful for descriptive searches such as:



```text

cozy mountain cabin with character

```



or:



```text

modern family home with an open layout and outdoor space

```



This allows the search system to match meaning instead of relying only on exact keywords.



\## Project Files



```text

week-06/

├── README.md

├── data/

│   └── listing-embeddings.json

├── src/

│   ├── embedding.ts

│   ├── listing-source.ts

│   ├── semantic-search.ts

│   ├── semantic-cli.ts

│   └── build-index.ts

└── tests/

&#x20;   └── semantic-search.test.ts

```



\## Embedding Model



The implementation uses:



```text

gemini-embedding-001

```



Each text query or listing is converted into a numerical embedding vector.



\## Cosine Similarity



Cosine similarity measures how close two embedding vectors are.



A higher score means the query and listing are more semantically similar.



Example:



```text

Match: 68.1%

```



\## Embedding Index



For the Week 6 demonstration, 500 active listings are pre-indexed.



The embeddings are generated once and stored in:



```text

week-06/data/listing-embeddings.json

```



This prevents the system from regenerating every listing embedding each time a user searches.



A production-scale implementation could use a dedicated vector database instead of a large local JSON file.



\## Build the Index



Set the number of listings to index:



```powershell

$env:INDEX\_LIMIT="500"

```



Then run:



```powershell

npx tsx week-06/src/build-index.ts

```



The index builder includes rate-limit handling and can resume from embeddings already saved to disk.



\## Run Semantic Search



Example:



```powershell

npx tsx week-06/src/semantic-cli.ts "modern cabin with mountain views and cozy character"

```



Example output:



```text

============================================================

&#x20;             IDX SEMANTIC PROPERTY SEARCH

============================================================

Query: modern cabin with mountain views and cozy character

Indexed listings searched: 500

\------------------------------------------------------------

Top 5 Matches



\#1  Big Bear City

Price:       $415,000

Property:    SingleFamilyResidence | 3 bd | 1 ba | 960 sq ft

Match:       68.1%

Description: Escape to the mountains and indulge in the ultimate cabin retreat...

```



\## Tests



Run:



```powershell

npx tsx week-06/tests/semantic-search.test.ts

```



Expected result:



```text

Week 6 semantic search tests passed.

```



The tests verify basic cosine similarity behavior for identical, unrelated, and similar vectors.



\## What I Learned



This week I learned how embeddings can represent the meaning of natural-language text as numerical vectors.



I also learned how cosine similarity can rank real-estate listings based on semantic relevance rather than exact keyword matching.



Precomputing listing embeddings makes repeated searches faster because only the user's new query needs to be embedded at search time.



The main practical limitation I encountered was API rate limiting, so the index builder saves progress and retries when the embedding API reaches its request limit.

