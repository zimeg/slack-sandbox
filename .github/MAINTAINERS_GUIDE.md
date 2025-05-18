# Maintainers guide

So many samples reaching production and snippets in motion. Best keep tidy!

## Synchronizing samples

Certain directories are uploaded to branches in the [zimeg/slacks][slacks] repo
after changes are made. This is for quick creates with the CLI using:

```sh
$ slack create zimeg/slacks --branch <name>
```

Sources of truth are found in this repository. The other is merely a mirror.

### Including additional applications

New projects can be added to the `.github/workflows/samples.yml` for automatic
uploads on changes.

### Preparing a personal access token

Changes across repositories require certain permissions and credentials. Set up
a [personal access token][pat] with **Read and Write** access for "Contents" on
select repos.

After creating the token, add it as a repository secret: `SANDBOX_ACCESS_TOKEN`

#### Runner configurations

Personal computation is applied towards running personal production apps and
package sharing across sample changes.

Additional **Read and Write** access for "Administration" is needed to create a
new runner as [TOM][tom].

[pat]: https://github.com/settings/personal-access-tokens
[slacks]: https://github.com/zimeg/slacks
[tom]: https://github.com/zimeg/.DOTFILES/blob/11552faaf56fb024a9d964349f689eab3d23a008/machines/tom/services/github-runners/default.nix#L20-L27
