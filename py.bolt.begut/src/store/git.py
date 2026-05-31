import logging
import subprocess
import tempfile
from collections.abc import Iterable
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
    """Reset local state and fetch all remotes."""
    subprocess.run(["git", "reset", "--hard", "HEAD"], cwd=repo, check=True)
    subprocess.run(["git", "clean", "-fd"], cwd=repo, check=True)
    subprocess.run(["git", "fetch", "--all"], cwd=repo, check=True)


def checkout(repo: Path, branch: str) -> None:
    """Checkout a branch, preferring local, then remote, then a new branch."""
    local_result = subprocess.run(
        ["git", "show-ref", "--verify", "--quiet", f"refs/heads/{branch}"],
        cwd=repo,
    )
    if local_result.returncode == 0:
        subprocess.run(["git", "checkout", branch], cwd=repo, check=True)
        return

    remote_result = subprocess.run(
        ["git", "show-ref", "--verify", "--quiet", f"refs/remotes/origin/{branch}"],
        cwd=repo,
    )
    if remote_result.returncode == 0:
        subprocess.run(
            ["git", "checkout", "-b", branch, "--track", f"origin/{branch}"],
            cwd=repo,
            check=True,
        )
        return

    subprocess.run(["git", "checkout", "-b", branch], cwd=repo, check=True)


def merge_squash(repo: Path, branch: str) -> None:
    """Squash merge a remote branch into the current branch."""
    subprocess.run(
        ["git", "merge", "--squash", f"origin/{branch}"],
        cwd=repo,
        check=True,
    )


# Committing


def commit(repo: Path, message: str, paths: Iterable[Path | str]) -> bool:
    """Stage and commit the given paths. Returns False if nothing to commit."""
    subprocess.run(
        ["git", "add", "-A", *(str(path) for path in paths)],
        cwd=repo,
        check=True,
    )
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
