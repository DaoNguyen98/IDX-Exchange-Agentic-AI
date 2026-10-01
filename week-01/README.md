>> # Week 1 - OpenClaw Architecture Fundamentals
>>
>> ## Overview
>>
>> This week I learned the basic architecture of OpenClaw and how a user request moves through the system.
>>
>> At a high level, the flow is:
>>
>> User -> WhatsApp -> OpenClaw Runtime -> Skill Selector -> Tool Execution -> Memory Update -> Response -> User
>>
>> In my local setup, WhatsApp is the communication channel, OpenClaw handles the runtime and routing, Gemini is the language model used by the agent, and MySQL stores the MLS property data.
>>
>> The main OpenClaw components I reviewed are:
>>
>> - Skills
>> - Channels
>> - Sessions
>> - Tools
>> - Memory
>> - Orchestrator
>>
>> ## Key Components
>>
>> ### 1. Channels
>>
>> Channels are the communication interfaces that users use to talk to OpenClaw.
>>
>> Examples include WhatsApp, email, and web.
>>
>> In my setup, I connected WhatsApp to OpenClaw using the WhatsApp extension. When a user sends a WhatsApp message, the message enters OpenClaw through the channel layer.
>>
>> ### 2. Sessions
>>
>> Sessions keep track of the current conversation state for each user.
>>
>> For example, if a user says:
>>
>> "Find 3-bedroom homes in Irvine."
>>
>> and then says:
>>
>> "Only show ones under $1.5 million."
>>
>> the session helps OpenClaw understand that the second message still refers to 3-bedroom homes in Irvine.
>>
>> ### 3. Skills
>>
>> Skills are modular capability units that tell the agent how to handle a certain type of task.
>>
>> Examples include property search, market statistics, weather, or RAG.
>>
>> A skill can describe when it should be used, what information to extract, and what tools should be called.
>>
>> ### 4. Tools
>>
>> Tools are functions that perform the actual work.
>>
>> For example, a property search tool could query the MySQL database and return matching properties.
>>
>> The skill provides the instructions, while the tool performs the action.
>>
>> ### 5. Memory
>>
>> Memory stores information that may be useful beyond the immediate message.
>>
>> OpenClaw can use short-term session state and longer-term memory so the agent can keep useful context over time.
>>
>> ### 6. Orchestrator
>>
>> The orchestrator coordinates the flow of work.
>>
>> It helps route a request to the correct skill, tool, or agent and makes sure the result is returned to the user.
>>
>> ## Architecture Workflow
>>
>> The following diagram shows how a user request moves through my Week 1 OpenClaw setup.
>>
>> ```text
>> User
>>   |
>>   v
>> WhatsApp
>>   |
>>   v
>> WhatsApp Channel Extension
>>   |
>>   v
>> OpenClaw Gateway / Runtime
>>   |
>>   v
>> Routing
>>   |
>>   v
>> Session Context
>>   |
>>   v
>> Agent Runtime
>>   |
>>   v
>> Skill Selection
>>   |
>>   v
>> Tool Execution
>>   |
>>   v
>> MySQL MLS Database
>>   |-- rets_property
>>   `-- california_sold
>>   |
>>   v
>> Memory / Session Update
>>   |
>>   v
>> OpenClaw Response
>>   |
>>   v
>> WhatsApp
>>   |
>>   v
>> User
>> ```
>> What I Learned
>> In Week 1, I learned how the main OpenClaw components work together.
>> I learned that channels receive user messages, sessions keep conversation context, skills describe how certain tasks should be handled, and tools perform the actual actions.
>> I also learned that the OpenClaw gateway and routing system help move requests to the correct agent or capability.
>> Gemini acts as the language model used by the agent to understand user requests and decide what actions are needed.
>> For the IDX project, this architecture will allow a user to send a property-related request through WhatsApp, process it with OpenClaw, query the MLS data stored in MySQL, and return the result back to the user.
>> Understanding this architecture will help me build property search, market statistics, RAG, and other real-estate agent features in later weeks.
