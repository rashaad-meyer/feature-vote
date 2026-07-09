# Backend

- Can you write me DRF database models that uses the following: 
    1. Idea: id, title, description, vote_count, created_at, created_by (vote count needs to be integer, I think we'll trade-off slight drift for performance)
    2. Vote: id, idea_id, user_id, created_at (make idea_id and user_id a unique constraint. One of the requirements is that a user can only vote once on an idea)
    3. User: username, password (I think we can just use django user model for this)
---
- Write a unit test that verifies that a user can only vote once on an idea
---
- Can you implement the boilerplate code for authentication. I think we can just keep it simple and use token based authentication.
---


# Frontend

- Can you implement the sign in page using a simple flow to authenticate a seeded user?
---
- Can you structure of the ideas page (including styling)? It needs to display a list of ideas and show current vote counts, there should be a create button that opens a component. It should also support sorting so add UI components for that. I will build the functionality in
---
