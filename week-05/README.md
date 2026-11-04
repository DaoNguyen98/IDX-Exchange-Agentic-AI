\# Week 5 — Market Analytics Agent



\## Overview



This week focused on building a market analytics agent using the `california\_sold` historical sales table together with active inventory data from `rets\_property`.



The agent can answer natural-language real estate market questions such as:



\- What is the median home price in Irvine?

\- What is the average price per square foot in Pasadena?

\- Is price per square foot rising or falling?

\- What is the monthly days-on-market trend?

\- How many active homes are currently listed?

\- How does inventory compare with recent sales?

\- Does the market favor buyers or sellers?

\- What is the month-over-month market change?

\- What is the year-over-year market change?



The system also maintains session context so follow-up questions can reuse the previously selected city and property type.



\---



\## Data Sources



\### `california\_sold`



This table contains historical closed-sale records and is used for:



\- Average close price

\- Median close price

\- Price per square foot

\- Days on market

\- List-to-close price ratio

\- Monthly price trends

\- Month-over-month comparisons

\- Year-over-year comparisons

\- Recent sales volume



Invalid future sale dates are excluded from analytics queries.



\### `rets\_property`



This table contains current property listings and is used for active inventory calculations.



Relevant fields include:



\- `L\_City`

\- `L\_Zip`

\- `L\_Type\_`

\- `L\_Status`

\- `StandardStatus`



Only listings with active status are counted as current inventory.



\---



\## Supported Market Metrics



\### Average Close Price



The agent calculates the average sold price for a city, ZIP code, and optional property type.



Example:



```text

You: What is the average home price in Irvine?



Agent:

The average sold price for homes in Irvine is ...

```



\---



\### Median Close Price



Median price is calculated separately from average price so unusually expensive or inexpensive properties have less influence on the result.



Example:



```text

You: What is the median home price in Irvine?



Agent:

The median sold price for homes in Irvine is $1,494,444.

This is based on 1,102 recent sales.

```



\---



\### Price Per Square Foot



The agent calculates average sold price per square foot using:



```text

ClosePrice / LivingArea

```



Properties with invalid or zero living area are excluded from this calculation.



Example:



```text

You: What is the average price per square foot in Irvine?

```



\---



\### Price Per Square Foot Trend



Monthly price-per-square-foot values are compared over the available historical period.



The agent classifies the trend as:



\- Rising

\- Falling

\- Stable

\- Insufficient data



Example:



```text

You: Is price per square foot rising or falling in Irvine?



Agent:

Price per square foot for homes in Irvine appears falling.

The monthly average price per square foot changed by -7.2% across the available recent period.

```



\---



\### List-to-Close Price Ratio



The list-to-close ratio compares the final sold price with the original list price.



The metric is calculated as:



```text

ClosePrice / ListPrice \* 100

```



A value below 100% indicates properties generally sold below asking price.



A value around 100% indicates properties generally sold near asking price.



A value above 100% indicates properties generally sold above asking price.



\---



\### Average Days on Market



The agent calculates how long properties remain on the market before closing.



Example:



```text

You: What is the average days on market in Irvine?

```



\---



\### Monthly Days-on-Market Trend



The agent can show average days on market for each available month.



Example:



```text

You: What is the monthly days on market trend for condos in Irvine?



Agent:

Monthly average days on market for condos in Irvine:

2026-03: 39.2 days

2026-04: 45.7 days

2026-05: 37.6 days

2026-06: 35.1 days

2026-07: 52.5 days

2026-08: 35.8 days

2026-09: 49.3 days

```



\---



\## Inventory Analytics



Current active inventory is calculated from `rets\_property`.



Recent sold volume is calculated from `california\_sold` using sales from the previous 90 days.



The agent calculates:



```text

Inventory-to-recent-sales ratio =

Active Listings / Recent Sales

```



Example:



```text

You: Does the Irvine market favor buyers or sellers?



Agent:

Irvine condos market snapshot:

Median sold price: $1,250,000

Average price/sq ft: $765

Average days on market: 42.2

List-to-close ratio: 98.1%

Recent price trend: falling (-10.2%)

Active listings: 363

Sold in last 90 days: 126

Inventory-to-recent-sales ratio: 2.88



The market looks relatively balanced.

```



The current buyer-versus-seller interpretation uses list-to-close ratio and average days on market as simple indicators.



\---



\## Month-over-Month Comparison



The agent compares the two latest available months.



Supported month-over-month metrics include:



\- Average sold price

\- Price per square foot

\- Days on market

\- Sales volume



Example:



```text

You: How did the Irvine market change from last month?



Agent:

Month-over-month market change for homes in Irvine:

2026-08 → 2026-09

Average price: -12.4%

Price per sq ft: -4.1%

Days on market: +27.8%

Sales volume: -40.8%

```



A more specific question can request only one metric.



Example:



```text

You: What is the month-over-month price per square foot change in Irvine?



Agent:

Month-over-month price-per-square-foot change for homes in Irvine:

2026-08 → 2026-09

Price per sq ft change: -4.1%

```



\---



\## Year-over-Year Comparison



The system also supports year-over-year comparisons.



For a valid year-over-year comparison, the latest available month must have a matching month from the previous year.



For example:



```text

2026-09

```



must be compared with:



```text

2025-09

```



If the matching previous-year data does not exist, the agent does not estimate or invent a value.



Example:



```text

You: What is the year-over-year price change in Irvine?



Agent:

There isn't enough historical data to calculate a year-over-year comparison for homes in Irvine.

```



This prevents misleading analytics when the historical dataset is incomplete.



\---



\## Location Filters



The analytics engine supports filtering by:



\- California city

\- ZIP code

\- Property type



Examples:



```text

What is the median home price in Irvine?

```



```text

What is the median home price in ZIP code 92618?

```



```text

What is the median condo price in Irvine?

```



Supported property types include:



\- Condominium

\- Single-family residence

\- Townhouse

\- Manufactured home

\- Duplex



\---



\## Conversational Session Memory



The market agent maintains session context.



For example:



```text

You: What is the monthly days on market trend for condos in Irvine?

```



The agent remembers:



```text

City = Irvine

Property type = Condominium

```



A later question such as:



```text

You: Does the market favor buyers or sellers?

```



continues using Irvine condos unless the session is reset or a different location/property type is provided.



The command:



```text

reset

```



clears the current market conversation.



\---



\## Pending Question Handling



The agent can also handle incomplete questions.



Example:



```text

You: Does the market favor buyers or sellers?



Agent:

Which California city or ZIP code would you like to analyze?



You: San Diego

```



The agent remembers the original question and answers it using San Diego data.



\---



\## Project Structure



```text

week-05/

├── README.md

└── src/

&#x20;   ├── market-agent.ts

&#x20;   ├── market-chat.ts

&#x20;   ├── market-session.ts

&#x20;   ├── market-stats.ts

&#x20;   ├── market-trend.ts

&#x20;   └── inventory-stats.ts

```



\### `market-agent.ts`



Routes natural-language market questions to the appropriate analytics logic and formats responses.



\### `market-chat.ts`



Provides an interactive terminal conversation for testing the market agent.



\### `market-session.ts`



Stores conversational context such as:



\- City

\- ZIP code

\- Property type

\- Pending question



\### `market-stats.ts`



Calculates market summary metrics such as:



\- Average price

\- Median price

\- Price per square foot

\- Days on market

\- List-to-close ratio



\### `market-trend.ts`



Calculates:



\- Monthly trends

\- Price trend direction

\- Price-per-square-foot trend

\- Month-over-month comparisons

\- Year-over-year comparisons



\### `inventory-stats.ts`



Compares active listings from `rets\_property` with recent closed sales from `california\_sold`.



\---



\## Running the Agent



From the project root:



```powershell

npm run market-chat

```



The MySQL environment variables must be configured before running the agent.



Example:



```powershell

$env:MYSQL\_HOST="localhost"

$env:MYSQL\_USER="root"

$env:MYSQL\_PASSWORD="YOUR\_REAL\_PASSWORD"

$env:MYSQL\_DATABASE="idx\_exchange"

npm run market-chat

```



Do not commit database passwords or API keys to GitHub.



\---



\## Example Conversation



```text

You: What is the median home price in Irvine?



Agent:

The median sold price for homes in Irvine is $1,494,444.

This is based on 1,102 recent sales.



You: Is price per square foot rising or falling in Irvine?



Agent:

Price per square foot for homes in Irvine appears falling.

The monthly average price per square foot changed by -7.2% across the available recent period.



You: What is the month-over-month price change in Irvine?



Agent:

Month-over-month average price change for homes in Irvine:

2026-08 → 2026-09

Price change: -12.4%

```



\---



\## What I Learned



During Week 5, I learned how to turn raw real estate records into useful market-level analytics.



I learned the difference between average and median price and why median price can better represent a housing market when expensive outliers exist.



I also learned how to calculate price per square foot, days on market, and list-to-close ratio directly from historical MLS-style records.



Building monthly trend analysis helped me understand how time-based aggregation can be used to identify changes in housing prices, market speed, and sales volume.



I implemented month-over-month comparisons by comparing the latest two available months and added year-over-year logic that requires the same month from the previous year.



I also learned that an analytics agent should not invent results when the dataset is incomplete. When historical data is unavailable, the agent returns an insufficient-data response instead.



Finally, I combined historical sold data with current active inventory so the agent can provide a broader market snapshot instead of relying on a single metric.

