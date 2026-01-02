# Taste Graph Analysis

My Twitter bookmarks database is at ./bookmarks.db

The purpose of this analysis is to find and surface novel, interesting, and surprising patterns within my bookmarks. Not only in mining connections between my bookmarks, but what those bookmarks say about me, and how my bookmarking patterns might reflect how I've changed over time. In essense, I want you to help me accomplish the following: discovering hidden connections, and understanding myself better.

**Important**: The sections below are a starting framework, not a rigid script. If you discover an interesting rabbit hole — an unexpected pattern, a curious outlier, a hidden connection — follow it. The goal is genuine insight, not checkbox completion.

Also, the date associated with any particular bookmark represents the date that tweet was posted by OP, NOT the date I bookmarked it. Unfortunately, the datetime of when I bookmarked isn't available. This date could still be useful as a potential proxy for time-of-bookmark though, and you can still run interesting temporal analyses using it.

## Schema Reference

```sql
-- Users: Tweet authors
users (
  id TEXT PRIMARY KEY,      -- Twitter user ID
  name TEXT,                -- Display name
  handle TEXT,              -- @handle
  profilePicUrl TEXT,
  verified BOOLEAN
)

-- Bookmarks: Saved tweets
bookmarks (
  id TEXT PRIMARY KEY,      -- Tweet ID
  date DATETIME,            -- When tweet was posted
  text TEXT,                -- Tweet content
  url TEXT,                 -- Link to tweet
  quote_status TEXT,        -- Quoted tweet JSON (nullable)
  user_id TEXT REFERENCES users(id)
)

-- Media: Photos/videos attached to tweets
media (
  id INTEGER PRIMARY KEY,
  bookmark_id TEXT REFERENCES bookmarks(id),
  type TEXT,                -- "photo", "video", "animated_gif"
  url TEXT,
  video_src TEXT            -- JSON with video URLs
)

-- Links: External URLs in tweets
links (
  id INTEGER PRIMARY KEY,
  bookmark_id TEXT REFERENCES bookmarks(id),
  shortUrl TEXT,            -- t.co link
  expandedUrl TEXT          -- Full URL
)

-- Full-text search index
bookmarks_fts USING fts5(text, link_text)
```

## Analysis

Run these analyses and present findings with ASCII visualizations:

### 1. Overview

- Total counts: bookmarks, users, media, links
- Date range of bookmarks

### 2. Top Voices

- Top 15 most-bookmarked accounts
- Show as clean ASCII table with handle and count

### 3. Temporal Patterns

- Bookmarks by year (all time)
- Bookmarks by month (last 2 years)
- Top 5 biggest single-day spikes — show what I saved those days

### 4. Topic Clusters

Discover what topics dominate this user's bookmarks:

1. **First, sample the data** — read ~50 random bookmarks and the top external domains from `links.expandedUrl`
2. **Propose 5-7 topic clusters** based on what you observe (don't assume — discover)
3. **Define keywords** for each cluster you identify
4. **Quantify** each cluster using keyword matching on `bookmarks.text`

This should reflect _this user's_ actual interests, not a generic template.

### 5. Co-Occurrence Network

Find accounts I bookmark on the same days (reveals intellectual connections):

```sql
WITH daily AS (
  SELECT DATE(date) as day, u.handle
  FROM bookmarks b JOIN users u ON b.user_id = u.id
)
SELECT a.handle, b.handle, COUNT(*) as together
FROM daily a JOIN daily b ON a.day = b.day AND a.handle < b.handle
GROUP BY a.handle, b.handle HAVING together >= 3
ORDER BY together DESC LIMIT 15;
```

### 6. Relationship Timeline

- **Loyalists**: Accounts bookmarked across 2+ years (my "north stars")
- **Faded**: 3+ saves historically, but none in last 6 months (who did I forget?)
- **New discoveries**: 3+ saves, all within last 3 months (emerging interests)

### 7. External Links

- Top domains from `links.expandedUrl` (excluding twitter.com/x.com)
- Shows what resources I'm collecting (GitHub repos, YouTube, articles)

### 8. Synthesis

Create an ASCII visualization showing:

- My intellectual evolution over time
- Connections between voices I follow
- Topic clusters and how they relate

### 9. Open Exploration

Now go off-script. Dig deeper into the data and look for anything surprising:

- Anomalies, outliers, one-off bookmarks that don't fit any pattern
- Unusual time patterns (late night bookmarking? weekend vs weekday?)
- The single oldest bookmark — what was it? Does it still reflect who I am?
- Accounts I saved exactly once but the tweet was unusually long/rich
- Threads or quote-tweets that might indicate deeper engagement
- Any other pattern you notice that might be meaningful

Spend time here. This is where the most interesting discoveries often hide.

### 10. What Your Bookmarks Reveal About You

Use the patterns discovered above to build a psychological and cognitive profile of the user. This should go beyond "you like X topic" to reveal *how they think* and *what that means*.

**Title this section:** `# What Your Bookmarks Reveal About You`

**Process:**

1. **First, design your own diagnostic dimensions** based on what you've seen in this specific dataset. Examples of dimensions that *might* be relevant (but discover your own):
   - Practical vs theoretical orientation
   - Starting vs finishing energy
   - Breadth vs depth of attention
   - Past vs present vs future orientation
   - Solo vs collaborative framing
   - Optimistic vs critical lens

2. **For each dimension you identify, construct keyword queries** that would detect it in this user's bookmarks. Run the queries and report the ratios.

3. **Look for what's absent.** Scan for common life domains that barely appear: politics, health, relationships, entertainment, finance, etc. Absence is signal — either they get this elsewhere, or it's genuinely neglected.

4. **Examine the depth distribution:**
   - What % of accounts are saved exactly once? (breadth signal)
   - What % are saved 5+ times? (depth signal)
   - What does this ratio suggest about how they consume information?

5. **Identify the "north star" accounts** — voices bookmarked across multiple years. What do these persistent voices have in common? What does the user keep returning to that others fade from?

6. **Look for contradictions and tensions.** The interesting insights often live in the gaps: someone who saves productivity content but shows no completion-focused saves; someone who bookmarks team-building advice but only follows solo builders.

**Synthesize into:**

- **Strengths**: What cognitive patterns would serve them well? Ground every claim in specific numbers from your analysis.
- **Weaknesses/Blind spots**: What patterns might limit them? Where are they over-indexed or under-indexed? Be direct, not diplomatic.
- **Fields/endeavors they'd likely excel in**: Based on interest intersections and cognitive style — where do their overlapping interests suggest a unique niche?
- **Fields they'd likely struggle with**: Based on absences and anti-patterns
- **Core tension**: What's the central contradiction or unresolved question their bookmarks reveal?

**Tone:**
- Be direct and specific, not flattering
- Every claim needs a number behind it
- Name the tensions — don't smooth them over
- Write like a sharp friend who's been given full access to their reading history, not like a personality quiz result


### 11. Questions for Reflection

End with 5-7 questions that emerge organically from the analysis — things the data raises but cannot answer.

These should be:
- **Specific to patterns found** (reference actual numbers: "You save 3x more X than Y...")
- **Pointed, not generic** (not "Do you value learning?" but "Of your 3,200 saves, how many resulted in actual projects?")
- **Designed to surface something the user might not have noticed**

Avoid therapy-speak. Aim for the questions a perceptive friend would ask after spending an hour looking through your bookmarks with you.

**Important**: The self-portrait (Section 10) must come *after* the factual analysis in Sections 1-9. The psychological claims need to be grounded in specific data points already computed — don't speculate without numbers. If you want to make a claim about the user's cognitive style, first run the query that would test it.

## Output Style

- ASCII box-drawing for tables and diagrams
- Conversational and curious tone
- Point out surprising patterns

**Make it reflective, not just analytical.** Don't just present data — provoke thought. Sprinkle in observations and questions that help me see myself:

- _"Something happened here. Your bookmarking exploded in March — new project? Inspiration wave?"_
- _"You used to save @someone constantly, then stopped. Lost interest, or did they stop posting?"_
- _"This person appears across 6 years of your bookmarks — your intellectual north star."_
- _"27 bookmarks in one day. You were processing a cultural moment in real-time."_
- _"Faded connections — who did you forget?"_

You don't have to (and probably shouldn't) use these exact ones I listed above. They're just examples.

These probing questions are sometimes more valuable than the analysis itself. Use your judgment on when to include them — don't overdo it, but don't be dry either.

AVOID:

- writing in a "LLM-ey" style. The most egregious example are sentences that look like "This isn't ..., it's ...", or "That's not just ..., that's ..." . Avoid using sentences like these.

---

Let's explore!
