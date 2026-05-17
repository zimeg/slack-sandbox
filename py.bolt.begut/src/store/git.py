import logging
import subprocess
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


# Setup


def clone(remote: str) -> Path:
    """Clone a repo into a temp directory."""
    tmp = Path(tempfile.mkdtemp())
    subprocess.run(["git", "clone", remote, str(tmp)], check=True)
    return tmp


def add_remote(repo: Path, name: str, url: str) -> None:
    """Add a named remote."""
    subprocess.run(["git", "remote", "add", name, url], cwd=repo, check=True)


# Branching


def fetch(repo: Path) -> None:
    """Fetch all remotes."""
    subprocess.run(["git", "fetch", "--all"], cwd=repo, check=True)


def checkout(repo: Path, branch: str) -> None:
    """Checkout a branch, creating it if it doesn't exist remotely."""
    result = subprocess.run(
        ["git", "branch", "-r", "--list", f"origin/{branch}"],
        cwd=repo,
        capture_output=True,
        text=True,
    )
    if result.stdout.strip():
        subprocess.run(["git", "checkout", branch], cwd=repo, check=True)
    else:
        subprocess.run(["git", "checkout", "-b", branch], cwd=repo, check=True)


def merge_squash(repo: Path, branch: str) -> None:
    """Squash merge a remote branch into the current branch."""
    subprocess.run(
        ["git", "merge", "--squash", f"origin/{branch}"],
        cwd=repo,
        check=True,
    )


# Committing


def commit(repo: Path, message: str) -> bool:
    """Stage and commit all changes. Returns False if nothing to commit."""
    subprocess.run(["git", "add", "-A"], cwd=repo, check=True)
    result = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=repo)
    if result.returncode == 0:
        return False
    subprocess.run(["git", "commit", "-m", message], cwd=repo, check=True)
    return True


def push(repo: Path, remote: str, branch: str) -> None:
    """Push a branch to a remote."""
    subprocess.run(["git", "push", remote, branch], cwd=repo, check=True)


def delete_remote_branch(repo: Path, branch: str) -> None:
    """Delete a branch on origin."""
    subprocess.run(["git", "push", "origin", "--delete", branch], cwd=repo, check=True)
