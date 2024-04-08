# synvert-javascript

<img src="https://synvert.net/img/logo_96.png" alt="logo" width="32" height="32" />

[![Version](https://img.shields.io/npm/v/synvert.svg)](https://npmjs.org/package/synvert)
[![AwesomeCode Status for synvert-hq/synvert-javascript](https://awesomecode.io/projects/a211af53-b83c-49e0-b12f-985463cbf297/status)](https://awesomecode.io/repos/synvert-hq/synvert-javascript)

`synvert-javascript` is a command tool to rewrite javascript code automatically, it depends on `synvert-core-javascript` and `synvert-snippets-javascript`.

[synvert-core-javascript](https://github.com/synvert-hq/synvert-core-javascript) provides a set of DSLs to rewrite javascript code.

[synvert-snippets-javascript](https://github.com/synvert-hq/synvert-snippets-javascript) provides official snippets to rewrite javascript code.

## Installation

Install through npm

```
$ npm install -g synvert
```

This will also install `synvert-core-javascript`.

Synvert is completely working with remote snippets on github,
but you can sync all official snippets locally to make it run faster.

```
$ synvert-javascript --sync
```

Then you can use synvert to rewrite your javascript code, e.g.

```
$ synvert-javascript -r jqeury/migrate
```

## Usage

```
$ synvert-javascript --help
Write javascript code to rewrite javascript code

USAGE
  $ synvert-javascript

OPTIONS
  -e, --execute=execute          execute a snippet, run or test
  -f, --format=format            output format
  -g, --generate=generate        generate a snippet with snippet name
  -h, --help                     show CLI help
  -l, --list                     list snippets
  -r, --run=run                  run a snippet with snippet name, or local file path, or remote http url
  -s, --show=show                show a snippet with snippet name
  -t, --test=test                test a snippet with snippet name, or local file path, or remote http url
  -v, --version
  --max-file-size=max-file-size  [default: 10240] skip file if its size is more than the size
  --no-semi                      prefer no semicolon, it prints semicolon by default
  --only-paths=only-paths        only paths, splitted by comma
  --root-path=root-path          [default: .] project root path
  --show-run-process             show processing files when running a snippet
  --single-quote                 prefer single quote, it uses double quote by default
  --skip-paths=skip-paths        [default: **/node_modules/**] skip paths, splitted by comma
  --sync                         sync snippets
  --tab-width=tab-width          [default: 2] prefer tab width
```

## Commands

### Sync snippets

[Official Snippets](https://github.com/synvert-hq/synvert-snippets-javascript) are available on github,
you can sync them any time you want.


```
$ synvert-javascript --sync
```

### List snippets

List all available snippets.

```
$ synvert-javascript -l

$ synvert-javascript --list --format json
```

### Show a snippet

Describe what a snippet does.

```
$ synvert-javascript -s jquery/migrate
```

### Run a snippet

Run a snippet, analyze and then rewrite code.

```
$ synvert-javascript --run jquery/migrate
```

Run a snippet from remote url.

```
$ synvert-javascript --run https://raw.githubusercontent.com/synvert-hq/synvert-snippets-javascript/master/lib/javascript/no-useless-constructor.js
```

Run a snippet from local file.

```
$ synvert-javascript --run ~/Sites/synvert-hq/synvert-snippets-javascript/lib/jquery/deprecate-event-shorthand.js
```

Show processing files when running a snippet.

```
$ synvert-javascript --run javascript/no-useless-constructor --show-run-progress
```

Skip large files.

```
# skip files if its size is more than 10KB
$ synvert-javascript --run javascript/no-useless-constructor --max-file-size 10240
```

Skip paths.

```
$ synvert-javascript --run javascript/no-useless-constructor --skip-paths **/node_modules/**,**/dist/**
```

Only paths.

```
$ synvert-javascript --run javascript/no-useless-constructor --only-paths frontend/src/javascripts
```

Root path.

```
$ synvert-javascript --run javascript/no-useless-constructor --root-path /repos/synvert
```

### Generate a snippet

```
$ synvert-javascript -g javascript/convert-foo-to-bar
```
