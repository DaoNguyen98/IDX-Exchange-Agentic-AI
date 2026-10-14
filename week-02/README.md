# Week 2 - Natural Language Property Search



## Goal



The goal of Week 2 is to convert free-text real estate queries into structured property filter objects that can later be used to query the `rets\_property` MLS table.



Example user query:



```text

Show me 3-bedroom condos in Irvine under $1.5M with a pool.

```



Example structured output:



```json

{

   "city": "Irvine",

   "maxPrice": 1500000,

   "beds": 3,

   "baths": null,

   "sqft": null,

   "type": "Condominium",

   "pool": "True",

   "hasView": null,

   "maxHoa": null

}

```



## Supported Filters

| User Intent | Parser Field | Database Column |
| --- | --- | --- |
| City | `city` | `L_City` |
| Maximum price | `maxPrice` | `L_SystemPrice` |
| Minimum bedrooms | `beds` | `L_Keyword2` |
| Minimum bathrooms | `baths` | `LM_Dec_3` |
| Minimum square feet | `sqft` | `LM_Int2_3` |
| Property type | `type` | `L_Type_` |
| Pool | `pool` | `PoolPrivateYN` |
| View | `hasView` | `ViewYN` |
| Maximum HOA | `maxHoa` | `AssociationFee` |



## Implementation



The parser is implemented in:



```text

src/property-parser.ts

```



The `parsePropertyQuery()` function uses regular expressions and simple normalization rules to identify supported property filters.



Examples of normalization:



- `$900k` -> `900000`

- `$1.5M` -> `1500000`

- `condo` -> `Condominium`

- `townhome` -> `Townhouse`

- `single family` -> `SingleFamilyResidence`

- `land` -> `UnimprovedLand`



The parser returns `null` for filters that are not present in the user's query.



## Testing



The parser is tested in:



```text

tests/property-parser.test.ts

```



I created 10 natural-language property search queries covering:



- city

- price

- bedrooms

- bathrooms

- square feet

- property type

- pool

- view

- HOA



All tests currently pass:



```text

Passed 10/10 tests.

```



## OpenClaw Skill



The OpenClaw skill definition is located in:



```text

property-search-skill/SKILL.md

```



The skill describes when property search parsing should be used, which filters are supported, and the expected structured output format.



## Week 2 Result



At the end of Week 2, the system can accept a natural-language property request and convert it into a structured filter object.



Database querying is not implemented in this week. The structured filters produced by this parser will be used by the database layer in Week 3.


