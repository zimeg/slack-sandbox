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

<!-- a collection of links -->
[pat]: https://github.com/settings/personal-access-tokens
[slacks]: https://github.com/zimeg/slacks
