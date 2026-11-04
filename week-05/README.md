# Week 5 - Market Analytics Agent

## Overview

This week focused on building a market analytics agent using the `california_sold` historical sales table together with active inventory data from `rets_property`.

The agent can answer natural-language real estate market questions such as:

- What is the median home price in Irvine?
- What is the average price per square foot in Pasadena?
- Is price per square foot rising or falling?
- What is the monthly days-on-market trend?
- How many active homes are currently listed?
- How does inventory compare with recent sales?
- Does the market favor buyers or sellers?
- What is the month-over-month market change?
- What is the year-over-year market change?

The system also maintains session context so follow-up questions can reuse the previously selected city and property type.

---

## Key Features

- Natural-language market questions
- Average and median sold prices
- Price-per-square-foot analytics
- Monthly price and DOM trends
- List-to-close price ratio
- Active inventory comparison
- Month-over-month analysis
- Year-over-year analysis
- City, ZIP code, and property-type filters
- Multi-turn conversational memory
- Safe handling of insufficient historical data

---

## Data Sources

### `california_sold`

The `california_sold` table contains historical closed-sale records.

It is used for:

- Average close price
- Median close price
- Price per square foot
- Days on market
- List-to-close price ratio
- Monthly price trends
- Month-over-month comparisons
- Year-over-year comparisons
- Recent sales volume

Future sale dates are excluded from analytics queries.

### `rets_property`

The `rets_property` table contains current property listings.

Relevant fields include:

- `L_City`
- `L_Zip`
- `L_Type_`
- `L_Status`
- `StandardStatus`

Only active listings are counted as current inventory.

---

## Supported Market Metrics

### Average Close Price

The agent calculates the average sold price for a city, ZIP code, and optional property type.

Example:

```text
You: What is the average home price in Irvine?
```

### Median Close Price

Example:

```text
You: What is the median home price in Irvine?

Agent:
The median sold price for homes in Irvine is $1,494,444.
This is based on 1,102 recent sales.
```

### Price Per Square Foot

The metric is calculated using:

```text
ClosePrice / LivingArea
```

Properties with zero or invalid living area are excluded.

Example:

```text
You: What is the average price per square foot in Irvine?
```

### Price Per Square Foot Trend

The agent can classify the trend as:

- Rising
- Falling
- Stable
- Insufficient data

Example:

```text
You: Is price per square foot rising or falling in Irvine?

Agent:
Price per square foot for homes in Irvine appears falling.
The monthly average price per square foot changed by -7.2% across the available recent period.
```

### List-to-Close Price Ratio

The metric is calculated as:

```text
ClosePrice / ListPrice * 100
```

Interpretation:

- Below 100%: homes generally sold below asking price
- Around 100%: homes generally sold near asking price
- Above 100%: homes generally sold above asking price

### Average Days on Market

Example:

```text
You: What is the average days on market in Irvine?
```

### Monthly Days-on-Market Trend

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

---

## Inventory Analytics

Current inventory is calculated from `rets_property`.

Recent sold volume is calculated from `california_sold` using sales from the previous 90 days.

The inventory ratio is:

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

The current buyer-versus-seller interpretation uses list-to-close ratio and average days on market as simple market indicators.

---

## Month-over-Month Comparison

The agent compares the latest two available months.

Supported metrics include:

- Average sold price
- Price per square foot
- Days on market
- Sales volume

Example:

```text
You: How did the Irvine market change from last month?

Agent:
Month-over-month market change for homes in Irvine:
2026-08 -> 2026-09
Average price: -12.4%
Price per sq ft: -4.1%
Days on market: +27.8%
Sales volume: -40.8%
```

Specific metrics can also be requested.

Example:

```text
You: What is the month-over-month price per square foot change in Irvine?

Agent:
Month-over-month price-per-square-foot change for homes in Irvine:
2026-08 -> 2026-09
Price per sq ft change: -4.1%
```

---

## Year-over-Year Comparison

The agent supports year-over-year comparisons when enough historical data exists.

For example:

```text
2026-09
```

must be compared with:

```text
2025-09
```

If the matching previous-year month is unavailable, the agent does not estimate or invent a result.

Example:

```text
You: What is the year-over-year price change in Irvine?

Agent:
There isn't enough historical data to calculate a year-over-year comparison for homes in Irvine.
```

---

## Location Filters

The analytics engine supports:

- California city
- ZIP code
- Property type

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

- Condominium
- Single-family residence
- Townhouse
- Manufactured home
- Duplex

---

## Conversational Session Memory

The agent remembers the selected city and property type during a conversation.

Example:

```text
You: What is the monthly days on market trend for condos in Irvine?
```

The session remembers:

```text
City = Irvine
Property type = Condominium
```

A later question such as:

```text
You: Does the market favor buyers or sellers?
```

continues using Irvine condos.

Use:

```text
reset
```

to clear the current conversation.

---

## Pending Question Handling

The agent also supports incomplete questions.

Example:

```text
You: Does the market favor buyers or sellers?

Agent:
Which California city or ZIP code would you like to analyze?

You: San Diego
```

The agent remembers the original question and answers it using San Diego data.

---

## Project Structure

```text
week-05/
|-- README.md
|-- src/
|   |-- inventory-stats.ts
|   |-- market-agent.ts
|   |-- market-chat.ts
|   |-- market-session.ts
|   |-- market-stats.ts
|   `-- market-trend.ts
`-- tests/
    |-- market-agent.test.ts
    |-- market-stats.test.ts
    `-- market-trend.test.ts
```

### `market-agent.ts`

Routes natural-language questions to the correct analytics logic and formats responses.

### `market-chat.ts`

Provides the interactive terminal conversation.

### `market-session.ts`

Stores:

- City
- ZIP code
- Property type
- Pending question

### `market-stats.ts`

Calculates:

- Average price
- Median price
- Price per square foot
- Days on market
- List-to-close ratio

### `market-trend.ts`

Calculates:

- Monthly trends
- Price trend direction
- Price-per-square-foot trend
- Month-over-month comparisons
- Year-over-year comparisons

### `inventory-stats.ts`

Compares current active listings with recent closed sales.

---

## Running the Agent

From the project root:

```powershell
npm run market-chat
```

The MySQL environment variables must be configured first.

Example:

```powershell
$env:MYSQL_HOST="localhost"
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="YOUR_REAL_PASSWORD"
$env:MYSQL_DATABASE="idx_exchange"

npm run market-chat
```

Do not commit database passwords or API keys to GitHub.

---

## Running Tests

Run:

```powershell
npx tsx --test week-05\tests\*.test.ts
```

Current result:

```text
tests 3
pass 3
fail 0
```

---

## Example Conversation

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
2026-08 -> 2026-09
Price change: -12.4%
```

---

## What I Learned

During Week 5, I learned how to turn raw real estate records into useful market analytics.

I learned how average and median prices can provide different views of a housing market and how price per square foot can be used to compare properties.

I also implemented days-on-market analysis, list-to-close ratio, monthly trends, and inventory comparisons.

I implemented month-over-month comparisons using the latest two available months.

For year-over-year analysis, the system requires the same month from the previous year. If that historical data is unavailable, the agent returns an insufficient-data response instead of inventing a result.

Finally, I combined historical sold data with current active inventory and added conversational memory so users can ask follow-up questions naturally.