# watch-app

Restart `.app` when it changes

```sh
npx watch-app ./path/to/foo.app
```

## How it works

The following paths are watched for changes:
- `<appPath>/Contents/MacOS/*`
- `<appPath>/Contents/Resources/**`

When a change is detected, the process of your `.app` is restarted with `kill -9` and `open`.

The process ID is tracked for future changes.

Simple!
