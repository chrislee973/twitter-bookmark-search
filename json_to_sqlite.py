# @markdown ### Create the database


import sqlite3
import json
from datetime import datetime
from tqdm.notebook import tqdm

DB_FILE = "bookmarks.db"


def parse_twitter_date(date_str):
    """
    Convert date/time strings to a SQLite-friendly format (YYYY-MM-DD HH:MM:SS).
    Adjust if your date formats differ.
    """
    if not date_str:
        return None
    fmt_variants = [
        "%Y-%m-%dT%H:%M:%S.%fZ",  # e.g. "2025-02-02T22:13:53.000Z"
        "%Y-%m-%dT%H:%M:%SZ",  # e.g. "2025-02-02T22:13:53Z"
        "%Y-%m-%d %H:%M:%S",  # fallback
    ]
    for fmt in fmt_variants:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%Y-%m-%d %H:%M:%S")
        except ValueError:
            pass
    # If all else fails, store as-is
    return date_str


def create_tables(db_path=DB_FILE):
    """
    Creates four tables (users, bookmarks, media, links), each with inline comments
    describing columns and a final comment summarizing the table's purpose.
    """
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    cur = conn.cursor()

    # 1) users table
    create_users = """
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,     -- The user’s unique ID (from "user":{"id":...})
        name TEXT,               -- The user’s display name (e.g. "George Mack")
        handle TEXT,             -- The user’s Twitter handle (e.g. "george__mack")
        profilePicUrl TEXT,      -- URL of the user's profile picture
        verified BOOLEAN         -- Indicates whether this user is verified
        -- The 'users' table stores all metadata about a Twitter user referenced in 'bookmarks'.
    );
    """
    cur.execute(create_users)

    # 2) bookmarks table
    create_bookmarks = """
    CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,     -- The bookmark’s unique identifier (i.e. Tweet ID)
        date DATETIME,           -- When the tweet was posted (parsed to DATETIME)
        text TEXT,               -- Full text of the tweet
        url TEXT,                -- Direct URL to the tweet on Twitter
        quote_status TEXT,       -- JSON data for any quote-tweets, or NULL
        user_id TEXT,            -- Foreign key referencing users(id)
        FOREIGN KEY (user_id) REFERENCES users(id)
        -- The 'bookmarks' table holds one row per saved tweet.
        -- Each bookmark references exactly one user (the tweet author)
        -- and may have multiple 'media' or 'links'.
    );
    """
    cur.execute(create_bookmarks)

    # 3) media table
    create_media = """
    CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookmark_id TEXT,        -- References bookmarks(id) to indicate which tweet
        type TEXT,               -- can be "photo", "video", or "animated_gif"
        url TEXT,                -- Direct URL to this piece of media
        video_src TEXT,          -- JSON with multiple video bitrates if it's a video, and provides urls for each version of the video
        FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id)
        -- The 'media' table contains one row per media item for each bookmark.
        -- A single tweet/bookmark can have multiple images or videos.
    );
    """
    cur.execute(create_media)

    # 4) links table
    create_links = """
    CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookmark_id TEXT,        -- References bookmarks(id), i.e. which tweet
        shortUrl TEXT,           -- Shortened link (e.g. "https://t.co/...")
        expandedUrl TEXT,        -- Full expanded URL. Use this column when presenting to the user
        FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id)
        -- The 'links' table stores all embedded links (URLs) found in a bookmark's text. Useful for finding blog posts, youtube videos, research papers, etc that are contained in all the bookmarks.
        -- One bookmark can have zero, one, or multiple links.
    );
    """
    cur.execute(create_links)

    conn.commit()
    conn.close()
    print("Tables (users, bookmarks, media, links) created successfully.")


def insert_data(json_data, db_path=DB_FILE):
    """
    Inserts rows into the users, bookmarks, media, and links tables.
    Avoids duplicate users with ON CONFLICT DO NOTHING on the users table.

    The JSON structure is assumed to look like:
    {
      "data": [
        {
          "id": "...",
          "date": "...",
          "text": "...",
          "url": "...",
          "links": [{ "shortUrl": "...", "expandedUrl": "..." }, ...],
          "user": {
             "id": "...",
             "name": "...",
             "handle": "...",
             "profilePicUrl": "...",
             "verified": false
          },
          "media": [...],
          "quote_status": ...
        },
        ...
      ]
    }
    """
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    cur = conn.cursor()

    data_list = json_data.get("data")
    if not isinstance(data_list, list):
        print("No 'data' array found in JSON. Nothing to insert.")
        return

    for bookmark in tqdm(data_list, desc="Inserting bookmarks"):
        # -------------------------------------------------------
        # 1) Insert into users table
        # -------------------------------------------------------
        user_obj = bookmark.get("user", {})
        user_id = user_obj.get("id")  # user "id" from JSON
        name = user_obj.get("name")
        handle = user_obj.get("handle")
        profilePicUrl = user_obj.get("profilePicUrl")
        verified = user_obj.get("verified", False)

        if user_id is not None:
            cur.execute(
                """
                INSERT INTO users (id, name, handle, profilePicUrl, verified)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(id) DO NOTHING
            """,
                (user_id, name, handle, profilePicUrl, verified),
            )

        # -------------------------------------------------------
        # 2) Insert into bookmarks table
        # -------------------------------------------------------
        bookmark_id = bookmark.get("id")
        dt_str = parse_twitter_date(bookmark.get("date"))
        text = bookmark.get("text")
        url = bookmark.get("url")

        # quote_status can be JSON if it's a dict/list
        qs_value = bookmark.get("quote_status")
        if isinstance(qs_value, (dict, list)):
            qs_value = json.dumps(qs_value)

        cur.execute(
            """
            INSERT INTO bookmarks (id, date, text, url, quote_status, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (bookmark_id, dt_str, text, url, qs_value, user_id),
        )

        # -------------------------------------------------------
        # 3) Insert into media table
        # -------------------------------------------------------
        media_list = bookmark.get("media", [])
        if isinstance(media_list, list):
            for m in media_list:
                mtype = m.get("type")
                murl = m.get("url")
                video_src_val = m.get("video_src")
                if isinstance(video_src_val, (dict, list)):
                    video_src_val = json.dumps(video_src_val)

                cur.execute(
                    """
                    INSERT INTO media (bookmark_id, type, url, video_src)
                    VALUES (?, ?, ?, ?)
                """,
                    (bookmark_id, mtype, murl, video_src_val),
                )

        # -------------------------------------------------------
        # 4) Insert into links table (NEW)
        # -------------------------------------------------------
        links_list = bookmark.get("links", [])
        if isinstance(links_list, list):
            for link_obj in links_list:
                shortUrl = link_obj.get("shortUrl")
                expandedUrl = link_obj.get("expandedUrl")
                cur.execute(
                    """
                    INSERT INTO links (bookmark_id, shortUrl, expandedUrl)
                    VALUES (?, ?, ?)
                """,
                    (bookmark_id, shortUrl, expandedUrl),
                )

    conn.commit()
    conn.close()


def create_and_populate_fts(db_path=DB_FILE):
    """
    Creates an FTS5 virtual table (bookmarks_fts) referencing the 'bookmarks' table
    and merging any links into a second column 'link_text'.
    Then populates it with current bookmark data.
    """
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # 1) Optionally drop the old FTS table if it exists
    cur.execute("DROP TABLE IF EXISTS bookmarks_fts;")

    # 2) Create the external-content FTS5 table
    create_fts_sql = """
    CREATE VIRTUAL TABLE bookmarks_fts
    USING fts5(
      text,                -- from bookmarks.text
      link_text,           -- will store all expanded URLs for the bookmark
      content='bookmarks', -- external content table
      content_rowid='id'   -- use bookmarks.id as the rowid
    );
    """
    cur.execute(create_fts_sql)

    # 3) Populate the FTS table by joining bookmarks + links
    #    We group by b.id so each bookmark is one row in FTS,
    #    and we combine all expandedUrl strings (for any embedded links) into one column (link_text).
    insert_fts_sql = """
    INSERT INTO bookmarks_fts(rowid, text, link_text)
    SELECT b.id AS rowid,
           b.text AS text,
           COALESCE(GROUP_CONCAT(l.expandedUrl, ' '), '')
    FROM bookmarks b
    LEFT JOIN links l ON b.id = l.bookmark_id
    GROUP BY b.id;
    """
    cur.execute(insert_fts_sql)

    conn.commit()
    conn.close()


# 1) Load bookmarks data from JSON
with open("bookmarks.json", "r") as f:
    bookmarks = json.load(f)

# 2) Create the tables
create_tables(DB_FILE)

# 3) Insert data
insert_data(bookmarks, DB_FILE)

# 4) Now that the main tables are loaded, create & populate the FTS
create_and_populate_fts(DB_FILE)

print(
    "Database successfully created. Click the download button below to save it to your computer."
)


# 5) Display download db button
from google.colab import files
import ipywidgets as widgets
from IPython.display import display


def download_file(b):
    files.download(DB_FILE)


button = widgets.Button(
    description=f"Download {DB_FILE}",
    button_style="success",
    layout=widgets.Layout(width="250px"),  # Adjust width as needed
)
button.on_click(download_file)
display(button)
