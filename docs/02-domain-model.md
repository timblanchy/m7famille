# m7famille — Domain Model

## Entities

### User

The person using the app. Handles authentication and ownership.

```
User
├── id          : UUID
├── email       : String (unique)
├── password    : String (hashed)
├── name        : String
├── createdAt   : DateTime
└── updatedAt   : DateTime
```

A User is **not** a Member. A User is someone with an account. A Member is a node in the family tree (could be a deceased ancestor who will never have an account).

A User can optionally be linked to a Member (when they "claim" their node).

---

### Family

A family tree. The top-level aggregate.

```
Family
├── id          : UUID
├── name        : String
├── createdAt   : DateTime
└── updatedAt   : DateTime
```

---

### Member

A person in the family tree. May or may not correspond to a living User.

```
Member
├── id          : UUID
├── familyId    : UUID (→ Family)
├── firstName   : String
├── lastName     : String (optional)
├── gender      : "M" | "F" | "OTHER"
├── birthDate   : Date (optional)
├── deathDate   : Date (optional)
├── createdAt   : DateTime
└── updatedAt   : DateTime
```

---

### Relationship

An explicit link between two members. Stored as its own entity for clarity and queryability.

```
Relationship
├── id          : UUID
├── familyId    : UUID (→ Family)
├── type        : "PARENT_CHILD" | "SPOUSE"
├── fromId      : UUID (→ Member)
├── toId        : UUID (→ Member)
├── createdAt   : DateTime
└── updatedAt   : DateTime
```

**Semantics:**

- `PARENT_CHILD`: `fromId` is the **parent**, `toId` is the **child**
- `SPOUSE`: `fromId` and `toId` are spouses (order doesn't matter)

**Constraints:**

- A member can have at most 2 `PARENT_CHILD` relationships where they are the child
- No duplicate relationships (same type + same pair)
- Both members must belong to the same family

---

### FamilyMembership

Links Users to Families with a role. This is what enables collaboration.

```
FamilyMembership
├── id          : UUID
├── userId      : UUID (→ User)
├── familyId    : UUID (→ Family)
├── memberId    : UUID (→ Member, optional) — the member node this user "is"
├── role        : "ADMIN" | "EDITOR" | "VIEWER"
├── createdAt   : DateTime
└── updatedAt   : DateTime
```

The family creator gets an ADMIN membership automatically.

---

## Entity Relationship Diagram

```
┌──────────┐         ┌──────────────────┐         ┌──────────┐
│   User   │────────▶│ FamilyMembership │◀────────│  Family  │
│          │    1:N  │                  │   N:1   │          │
│ email    │         │ role             │         │ name     │
│ password │         │ memberId? ───┐   │         │          │
└──────────┘         └──────────────│───┘         └────┬─────┘
                                    │                   │
                                    ▼                   │ 1:N
                               ┌──────────┐            │
                               │  Member  │◀───────────┘
                               │          │
                               │ firstName│
                               │ gender   │
                               │ birthDate│
                               │ deathDate│
                               └────┬─────┘
                                    │
                                    │ N:N (via Relationship)
                                    ▼
                            ┌───────────────┐
                            │ Relationship  │
                            │               │
                            │ type          │
                            │ fromId → Member│
                            │ toId   → Member│
                            └───────────────┘
```

---

## Key Design Decisions

### 1. User ≠ Member

Separating User (account) from Member (tree node) is critical because:

- Most members in a tree will never have an account (ancestors, young children)
- A user can later "claim" a member node via FamilyMembership.memberId
- This keeps auth concerns out of the tree data

### 2. Relationship as its own entity (not embedded arrays)

Storing relationships as a separate table rather than arrays on Member:

- Easier to query ("give me all children of X", "give me the path between A and B")
- Easier to enforce constraints (max 2 parents)
- Easier to add metadata later (marriage date on SPOUSE, adoption flag on PARENT_CHILD)
- Works naturally with SQL joins

### 3. FamilyMembership as join table

Rather than putting `role` on User or Family:

- A user can belong to multiple families (later)
- Roles are per-family, not global
- The optional `memberId` link cleanly models "this user IS this person in the tree"

---

## Database — PostgreSQL

### Proposed Schema

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE families (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    first_name  TEXT NOT NULL,
    last_name   TEXT,
    gender      TEXT NOT NULL CHECK (gender IN ('M', 'F', 'OTHER')),
    birth_date  DATE,
    death_date  DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE relationships (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('PARENT_CHILD', 'SPOUSE')),
    from_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    to_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (type, from_id, to_id),
    CHECK (from_id <> to_id)
);

CREATE TABLE family_memberships (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    member_id   UUID REFERENCES members(id) ON DELETE SET NULL,
    role        TEXT NOT NULL CHECK (role IN ('ADMIN', 'EDITOR', 'VIEWER')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, family_id)
);

-- Indexes for common queries
CREATE INDEX idx_members_family ON members(family_id);
CREATE INDEX idx_relationships_family ON relationships(family_id);
CREATE INDEX idx_relationships_from ON relationships(from_id);
CREATE INDEX idx_relationships_to ON relationships(to_id);
CREATE INDEX idx_family_memberships_user ON family_memberships(user_id);
CREATE INDEX idx_family_memberships_family ON family_memberships(family_id);
```

### Useful Queries

**Get all children of a member:**

```sql
SELECT m.* FROM members m
JOIN relationships r ON r.to_id = m.id
WHERE r.from_id = :memberId AND r.type = 'PARENT_CHILD';
```

**Get parents of a member:**

```sql
SELECT m.* FROM members m
JOIN relationships r ON r.from_id = m.id
WHERE r.to_id = :memberId AND r.type = 'PARENT_CHILD';
```

**Get full tree for a family (all members + relationships):**

```sql
SELECT m.*, r.type as rel_type, r.from_id, r.to_id
FROM members m
LEFT JOIN relationships r ON r.from_id = m.id OR r.to_id = m.id
WHERE m.family_id = :familyId;
```
