# m7famille — Strategy & Roadmap

## Vision

An open-source collaborative family tree web app. A family member starts a tree, invites relatives, and everyone contributes to build a shared history.

## Phase 1 — Core (MVP)

The minimum to be usable by one person building their family tree.

### Auth

- Sign up / login with email + password
- Session management (JWT or token-based)
- Password reset flow

### Family

- Create a family (the creator becomes admin)
- View / edit family info (name)

### Members & Relationships

- Create / read / update / delete family members
- Member data: name, gender, birth date, death date (all optional except name)
- Relationship types: parent/child, spouse
- A member can have: 0-2 parents, 0-N children, 0-N spouses
- Relationships are bidirectional (adding a child to A also adds A as parent of the child)

**Goal**: a user can fully model their family structure through a list/form interface.

---

## Phase 2 — Tree Visualization

A quality, readable visual representation of the family tree.

- Pedigree/descendant tree layout (vertical)
- Navigate by clicking on members
- Zoom / pan on large trees
- Responsive (works on desktop and tablet at minimum)
- Print-friendly export (PDF or image)

**Goal**: the tree is the "wow" feature — it must feel polished.

---

## Phase 3 — Collaboration & Media

### Photos

- Upload a profile photo per member
- Photo gallery per member (life moments)
- File storage (S3-compatible or local filesystem to start)

### Invitations

- Admin invites people by email
- Invitee creates an account and gets linked to an existing member node
- An invited user "claims" their node and owns their personal data

### Roles & Permissions

- **Admin**: full control (CRUD all members, invite, manage roles)
- **Editor**: can add/edit members and relationships
- **Viewer**: read-only access to the tree

### Activity Logs

- Track who changed what and when
- Simple chronological feed per family

**Goal**: the tree becomes a shared, living document for the whole family.

---

## Phase 4 — Later

Ideas for the future, not prioritized yet:

- Life events (marriage, milestones, custom events)
- Places (link locations to events)
- Multi-family support (one user in several trees)
- GEDCOM import/export (genealogy standard)
- Tree merging (two families discover shared branches)
- Public/private tree visibility
- Mobile PWA
- Full data export (JSON, PDF)
- Search & filter across members

## Out of Scope

- DNA integration
- AI-assisted research
- Monetization
