# Backend
### Prompt 
Can you write me DRF database models that uses the following: 
1. Idea: id, title, description, vote_count, created_at, created_by (vote countneeds to be integer, I think we'll trade-off slight drift for performance)
2. Vote: id, idea_id, user_id, created_at (make idea_id and user_id a uniqueconstraint. One of the requirements is that a user can only vote once on an idea)
3. User: username, password (I think we can just use django user model for this)

### Reasoning
I knew how to implement this already but this was quite trivial so I let AI write it because it can write it faster than I can and I just reviewed the code afterwards

---
### Prompt 
Write a unit test that verifies that a user can only vote once on an idea

### Reasoning
AI is good at creating unit tests and boilerplate code so I let it write the unit tests while I moved onto building the frontend. I reviewed the unit tests afterwards and it was spot on

---
### Prompt 
Can you implement the boilerplate code for authentication? I think we can just keep it simple and use token based authentication.

### Reasoning
Setting up the authentication for django is quite trivial so I just let AI handle it and I just review that it did it how I wanted to do it afterwards

---


# Frontend
### Prompt
Can you implement the sign in page using a simple flow to authenticate a seeded user?

### Reasoning
Sign in page is quite trivial and has been done so much before. AI probably has a lot of good training data on it so I just let it tackle this task for me.

---

### Prompt
Can you structure of the ideas page (including styling)? It needs to display a list of ideas and show current vote counts, there should be a create button that opens a component. It should also support sorting so add UI components for that. I will build the functionality in.

### Reasoning
I allowed AI to build out the structure of the UI because that part is quite easy. The hard part is building out functionality and handling state in the most correct way which it sometimes falls flat so I decided to do that on my own instead.
---
