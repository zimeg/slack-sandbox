from src.store.git import (
    add_remote,
    checkout,
    clone,
    commit,
    delete_remote_branch,
    fetch,
    push,
    read_file,
)


class Repos:
    def __init__(self, staging: str, production: str):
        self.repo = clone(staging)
        add_remote(self.repo, "production", production)

    def draft(self, ts: str, content: str) -> None:
        """Save or update markdown on a review branch on staging."""
        branch = f"review/{ts}"
        fetch(self.repo)
        checkout(self.repo, branch)
        filepath = self.repo / "Announcements" / f"{ts}.md"
        filepath.write_text(content)
        commit(self.repo, f"docs: update {ts}", [filepath])
        push(self.repo, "origin", branch)

    def publish(self, ts: str, title: str, date: str) -> str:
        """Publish a review draft to master, then push to both remotes.

        Returns the full title with date appended.
        """
        branch = f"review/{ts}"
        fetch(self.repo)
        checkout(self.repo, "master")

        full_title = f"{title} {date}" if date else title
        slug = full_title.replace(" ", "-")
        content = read_file(self.repo, f"origin/{branch}", f"Announcements/{ts}.md")

        dst = self.repo / "Announcements" / f"{slug}.md"
        dst.write_text(content)

        announcements = self._update_announcements(title, slug, date)

        commit(self.repo, f"chore: publish {full_title}", [dst, announcements])
        push(self.repo, "origin", "master")
        push(self.repo, "production", "master")
        delete_remote_branch(self.repo, branch)

        return full_title

    def _update_announcements(self, title: str, slug: str, date: str) -> str:
        """Prepend an entry to Announcements.md and return its path."""
        entry = f"- [{title}]({slug}) {date}" if date else f"- [{title}]({slug})"
        announcements = self.repo / "Announcements.md"
        if not announcements.exists():
            return str(announcements)
        lines = announcements.read_text().splitlines()
        for i, line in enumerate(lines):
            if line.startswith("- ["):
                lines.insert(i, entry)
                break
        else:
            lines.append(entry)
        announcements.write_text("\n".join(lines) + "\n")
        return str(announcements)
