### Release Aggregator

The purpose of this is a simple easy way to check version
differences on github. If you're updating between multiple semantic versioning
and wondering what's changed, This should help.

#### Setup
Add a file `secret.json` that contains your github username and a "Personal access token" tied to your username. 
See [secret-example.json](secret-example.json).

[Creating a Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)

Once that's done, build and run using node ^12. Once it's done, it will open up an index.md file from the dist directory.

#### Examples

```bash
node dist/index.js Microsoft/TypeScript 4.2.2 4.2.3 
```
