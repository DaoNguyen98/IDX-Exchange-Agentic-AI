---
name: property-search
description: Parse natural-language real estate queries into structured property search filters for the rets_property MLS table.
---

# Property Search

Use this skill when a user asks to search for properties using natural language.

The skill should extract supported property filters from the user's message and convert them into a structured object.

## Supported Filters

- city -> L_City
- maxPrice -> L_SystemPrice
- beds -> L_Keyword2
- baths -> LM_Dec_3
- sqft -> LM_Int2_3
- type -> L_Type_
- pool -> PoolPrivateYN
- hasView -> ViewYN
- maxHoa -> AssociationFee

## Example

User query:

"Show me 3-bedroom condos in Irvine under $1.5M with a pool."

Structured result:

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

## Behavior

1. Accept a free-text real estate query.
2. Extract any supported filters that are present.
3. Return null for filters that are not specified.
4. Normalize abbreviated prices such as 900k and 1.5M into full numeric values.
5. Normalize common property-type terms such as condo, townhome, single family, and land.
6. Do not query MySQL in this skill yet. Database querying is handled in the next stage of the project.