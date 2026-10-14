\---

name: property-search

description: Parse natural-language real estate queries into structured property search filters for the rets\_property MLS table.

\---



\# Property Search



Use this skill when a user asks to search for properties using natural language.



The skill should extract supported property filters from the user's message and convert them into a structured object.



\## Supported Filters



\- city -> L\_City

\- maxPrice -> L\_SystemPrice

\- beds -> L\_Keyword2

\- baths -> LM\_Dec\_3

\- sqft -> LM\_Int2\_3

\- type -> L\_Type\_

\- pool -> PoolPrivateYN

\- hasView -> ViewYN

\- maxHoa -> AssociationFee



\## Example



User query:



"Show me 3-bedroom condos in Irvine under $1.5M with a pool."



Structured result:



```json

{

&#x20; "city": "Irvine",

&#x20; "maxPrice": 1500000,

&#x20; "beds": 3,

&#x20; "baths": null,

&#x20; "sqft": null,

&#x20; "type": "Condominium",

&#x20; "pool": "True",

&#x20; "hasView": null,

&#x20; "maxHoa": null

}

