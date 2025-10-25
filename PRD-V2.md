# PRD: AI Prompt Library V2 - Cloud Sync & Enhanced Features

## Overview
Building on the successful V1 foundation, V2 adds cloud synchronization, user accounts, and advanced organization features while maintaining the simplicity and speed that made V1 great.

## Goals
- Enable seamless multi-device and cross-browser access
- Maintain offline-first functionality with sync when online
- Add advanced organization features (favorites, folders)
- Preserve the fast, lightweight user experience
- Optional login - keep working without an account

## Core V2 Features

### 1. Authentication & Cloud Sync
- **Optional Sign-In**: App works without login (LocalStorage mode)
- **Authentication Options**:
  - Google Sign-In (primary)
  - GitHub Sign-In
  - Email/Password (fallback)
- **Account Benefits Banner**: Show logged-out users what they're missing
- **Seamless Migration**: One-click to move LocalStorage data to cloud on first login

#### Sync Behavior
- **Offline First**: All operations work offline, sync when connected
- **Conflict Resolution**: Last-write-wins with timestamp
- **Sync Indicator**: Show sync status (synced, syncing, offline)
- **Manual Sync Button**: Force sync on demand
- **Auto-sync**: Background sync every 30 seconds when online

### 2. Advanced Organization

#### Favorites/Starred Prompts
- Star important prompts for quick access
- "Favorites" filter option
- Show starred count in stats

#### Folder System
- Create custom folders (max 50 per user)
- Drag-and-drop prompts into folders
- Folder colors/icons
- Nested folders (1 level deep)
- "All Prompts" view shows everything
- Default folder: "Uncategorized"

#### Collections
- Group related prompts (cross-folder)
- Share collections via link
- Import/Export collections separately

### 3. Sharing & Collaboration

#### Share Single Prompt
- Generate shareable link
- Public/Private toggle
- View count on shared prompts
- Embed code for websites
- Copy as Markdown option

#### Share Collections/Folders
- Share entire folder via link
- Read-only by default
- Optional: Allow duplicating to recipient's library
- Track shares (who viewed, when)

#### Import from Community
- Browse public prompt templates
- One-click import to your library
- Credit original creators

### 4. Enhanced Search & Discovery

#### Advanced Search
- Boolean operators (AND, OR, NOT)
- Search within specific folders
- Date range filters
- Use count filters (e.g., "unused prompts")
- Recently used filter

#### Smart Suggestions
- "Similar prompts" based on tags
- "You might also like..." recommendations
- Suggest tags based on prompt content

#### Saved Searches
- Save frequently used search queries
- Quick access to saved searches
- Smart folders based on search criteria

### 5. Analytics & Insights

#### Personal Stats Dashboard
- Total prompts created
- Most used prompts (top 10)
- Usage over time (chart)
- Most used categories
- Tag cloud visualization
- Prompts created this week/month

#### Per-Prompt Analytics
- Usage history timeline
- Last used date/time
- Average uses per week
- Related prompts used together

### 6. Quality of Life Improvements

#### Prompt Versioning
- Track prompt edits over time
- View version history
- Restore previous versions
- Compare versions side-by-side

#### Templates
- Prompt templates with variables
- Fill in variables before copying
- Example: "Write a {language} function that {task}"
- Save custom templates

#### Quick Actions
- Keyboard shortcuts (/, Cmd+K for search)
- Bulk operations (delete, move, tag)
- Duplicate prompt
- Create prompt from clipboard

#### Dark Mode
- Toggle dark/light theme
- System preference detection
- Smooth transition animation

#### Rich Text Preview
- Markdown rendering in preview
- Syntax highlighting for code blocks
- Format preservation

### 7. Browser Extension (Stretch Goal)
- Right-click context menu "Save as prompt"
- Quick access popup
- Copy prompt without opening app
- Available for Chrome, Firefox, Edge

## Technical Architecture

### Stack Updates

#### Backend Options (Choose One)

**Option A: Firebase (Recommended)**
- **Auth**: Firebase Authentication
- **Database**: Firestore
- **Storage**: For future file attachments
- **Hosting**: Firebase Hosting
- **Cost**: Free tier: 50K reads/day, 20K writes/day
- **Pros**: Easy setup, real-time sync, offline support built-in
- **Cons**: Vendor lock-in

**Option B: Supabase (Open Source Alternative)**
- **Auth**: Supabase Auth
- **Database**: PostgreSQL with real-time subscriptions
- **Storage**: Supabase Storage
- **Cost**: Free tier: 500MB database, 1GB storage
- **Pros**: Open source, SQL database, self-hostable
- **Cons**: More complex setup

**Option C: Custom Backend**
- **Stack**: Node.js + Express + PostgreSQL
- **Auth**: JWT with Passport.js
- **Hosting**: Railway, Render, or Fly.io
- **Pros**: Full control, no vendor lock-in
- **Cons**: Most maintenance, higher cost

#### Frontend Updates
- Keep vanilla JS or migrate to **lightweight framework** (optional)
  - Alpine.js (14KB) - stays close to vanilla
  - Preact (3KB) - React-like with minimal overhead
  - Svelte (compiled, no runtime) - fastest option
- **State Management**: For sync status, user state
- **Service Worker**: For offline support and caching

### Data Structure V2

```typescript
// User Profile
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp,
  lastLogin: timestamp,
  settings: {
    theme: 'light' | 'dark' | 'system',
    defaultSort: string,
    syncEnabled: boolean
  },
  subscription: 'free' | 'pro' // for future monetization
}

// Prompt V2 (extends V1)
{
  id: string,
  userId: string, // null for local-only
  title: string,
  text: string,
  category: string,
  tags: string[],
  dateAdded: timestamp,
  dateModified: timestamp,
  useCount: number,
  lastUsed: timestamp | null,
  starred: boolean,
  folderId: string | null,
  versions: PromptVersion[], // history
  isPublic: boolean,
  shareId: string | null, // for sharing
  shareCount: number,
  syncStatus: 'synced' | 'pending' | 'conflict'
}

// Folder
{
  id: string,
  userId: string,
  name: string,
  color: string,
  icon: string,
  parentId: string | null,
  order: number,
  createdAt: timestamp
}

// Collection
{
  id: string,
  userId: string,
  name: string,
  description: string,
  promptIds: string[],
  isPublic: boolean,
  shareId: string | null
}
```

### Migration Strategy

#### Phase 1: Core Sync (Week 1-2)
- Add Firebase/Supabase integration
- Implement authentication UI
- Basic cloud sync (prompts only)
- Migration tool from LocalStorage
- Deploy alongside V1

#### Phase 2: Organization (Week 3)
- Add folders feature
- Implement favorites/starring
- Enhanced search

#### Phase 3: Sharing (Week 4)
- Share single prompts
- Share collections
- Public/private toggles

#### Phase 4: Analytics & Polish (Week 5)
- Stats dashboard
- Dark mode
- Keyboard shortcuts
- Performance optimization

#### Phase 5: Advanced Features (Week 6+)
- Versioning
- Templates
- Browser extension (if time permits)

## User Experience Flow

### First-Time User (Not Logged In)
1. Lands on app → Works immediately with LocalStorage
2. Sees subtle banner: "Sign in to sync across devices"
3. Can dismiss banner and continue using locally
4. No forced registration

### Migration Flow (Existing V1 User)
1. User has 50 prompts in LocalStorage
2. Clicks "Sign in with Google"
3. After auth: "We found 50 prompts. Import to cloud?"
4. One-click import → All prompts synced
5. LocalStorage marked as migrated

### Multi-Device Flow
1. User signs in on laptop → Sees all prompts
2. Creates new prompt on laptop → Syncs to cloud
3. Opens app on phone → New prompt appears
4. Edits prompt offline on phone → Syncs when online
5. Laptop auto-refreshes with changes

## Success Metrics

### Technical Metrics
- Sync latency < 2 seconds
- App loads in < 1 second (cached)
- Offline functionality: 100% feature parity
- 99.9% uptime

### User Metrics
- 30% of users create accounts within 1 week
- 50% of logged-in users access from 2+ devices
- < 1% sync conflicts
- Daily active users (DAU) increase 2x

### Business Metrics (Future)
- Foundation for Pro tier ($5/month)
- Team accounts ($15/month for 5 users)
- API access for developers

## Competitive Analysis

| Feature | V1 (Current) | V2 (Proposed) | Notion | Airtable | PromptBase |
|---------|-------------|---------------|--------|----------|------------|
| Offline | ✅ | ✅ | ❌ | ❌ | ❌ |
| Multi-device | ❌ | ✅ | ✅ | ✅ | ✅ |
| No login required | ✅ | ✅ | ❌ | ❌ | ❌ |
| Speed | ⚡️⚡️⚡️ | ⚡️⚡️ | ⚡️ | ⚡️ | ⚡️⚡️ |
| Folders | ❌ | ✅ | ✅ | ✅ | ✅ |
| Sharing | ❌ | ✅ | ✅ | ✅ | ✅ |
| Free tier | ✅ | ✅ | Limited | Limited | Browse only |
| Cost | $0 | $0 | $8/mo | $10/mo | Marketplace |

## Monetization Strategy (Optional)

### Free Tier (Forever)
- 500 prompts
- 10 folders
- Basic sync
- Share via link

### Pro Tier ($5/month)
- Unlimited prompts
- Unlimited folders
- Version history (30 days)
- Priority sync
- Advanced analytics
- API access
- No branding

### Team Tier ($15/month for 5 users)
- All Pro features
- Shared workspaces
- Team collaboration
- Admin controls
- Usage analytics

## Privacy & Security

### Data Protection
- End-to-end encryption option for sensitive prompts
- GDPR compliance
- Data export at any time
- Account deletion removes all data
- No selling user data - ever

### Terms of Service
- Clear privacy policy
- Cookie consent (only essential cookies)
- Analytics opt-in
- Content ownership: User owns all prompts

## Development Estimate

### Timeline
- **Planning & Design**: 1 week
- **Core Development**: 5-6 weeks
- **Testing & Polish**: 1 week
- **Beta Testing**: 2 weeks
- **Total**: ~10 weeks

### Team Size
- 1 Full-stack developer (can do solo)
- 1 Designer (part-time, for UI updates)

### Cost Estimate (Firebase)
- **Hosting**: $0 (Firebase free tier)
- **Auth**: $0 (free)
- **Database**: $0-25/month (depends on usage)
- **Domain**: $12/year
- **Total**: < $50/month for first 1000 users

## Rollout Strategy

### Beta Program
- Invite V1 users to beta
- 2-week beta period
- Collect feedback
- Fix critical bugs

### Launch
- Soft launch: Blog post, Twitter
- Product Hunt launch
- Reddit (r/webdev, r/ChatGPT, r/ClaudeAI)
- Keep V1 available as "Classic Mode"

### Post-Launch
- Weekly updates based on feedback
- Monthly feature releases
- Build community

## Open Questions

1. **Framework choice**: Stay vanilla or use Alpine.js/Preact?
2. **Backend**: Firebase (easiest) or Supabase (open source)?
3. **Monetization**: Launch free forever or introduce Pro tier in V2?
4. **Browser extension**: Include in V2 or save for V3?
5. **Mobile app**: Web app only or native iOS/Android in future?

## Success Criteria

V2 is successful if:
- ✅ 90%+ feature parity with V1 in offline mode
- ✅ Zero data loss during migration
- ✅ Sync works reliably (< 1% error rate)
- ✅ 30%+ adoption of cloud sync
- ✅ App still loads in < 1 second
- ✅ Maintains clean, minimal UI
- ✅ Positive user feedback (> 4 stars)

## Next Steps

1. **Review & Approve PRD**: Get stakeholder buy-in
2. **Choose Tech Stack**: Firebase vs Supabase decision
3. **Design Mockups**: Updated UI with new features
4. **Set Up Infrastructure**: Firebase project, CI/CD
5. **Start Phase 1**: Authentication & basic sync
6. **Beta Launch**: Invite early users

---

**Document Version**: 1.0
**Created**: October 2025
**Status**: Draft - Awaiting Approval
**Owner**: Product Team
**Next Review**: After V1 launch metrics
