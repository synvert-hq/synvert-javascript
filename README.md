# synvert

<img src="https://synvert.xinminlabs.com/img/logo_96.png" alt="logo" width="32" height="32" />

[![Version](https://img.shields.io/npm/v/synvert.svg)](https://npmjs.org/package/synvert)
[![AwesomeCode Status for xinminlabs/synvert-javascript](https://awesomecode.io/projects/a211af53-b83c-49e0-b12f-985463cbf297/status)](https://awesomecode.io/repos/xinminlabs/synvert-javascript)

`synvert-javascript` is a command tool to rewrite javascript code automatically, it depends on `synvert-core-javascript` and `synvert-snippets-javascript`.

[synvert-core-javascript](https://github.com/xinminlabs/synvert-core-javascript) provides a set of DSLs to rewrite javascript code.

[synvert-snippets-javascript](https://github.com/xinminlabs/synvert-snippets-javascript) provides official snippets to rewrite javascript code.

## Installation

Install through npm

```
$ npm install -g synvert
```

This will also install `synvert-core-javascript`.

Before using synvert, you need to sync all official snippets first.

```
$ synvert-javascript --sync
```

Then you can use synvert to rewrite your javascript code, e.g.

```
$ synvert-javascript -r jqeury/migrate
```

Or use it without installing

```
$ npx -p synvert synvert-javascript --sync
$ npx -p synvert synvert-javascript --list
```

## Usage

```
$ synvert-javascript --help
Write javascript code to change javascript code

USAGE
  $ synvert-javascript

OPTIONS
  -f, --format=format      output format
  -g, --generate=generate  generate a snippet with snippet name
  -h, --help               show CLI help
  -l, --list               list snippets
  -r, --run=run            run a snippet with snippet name, or local file path, or remote http url
  -s, --show=show          show a snippet with snippet name
  -v, --version
  --enableEcmaFeaturesJsx  enable EcmaFeatures jsx
  --onlyPaths=onlyPaths    only paths, splitted by comma
  --rootPath=rootPath      [default: .] project root path
  --showRunProcess         show processing files when running a snippet
  --skipPaths=skipPaths    [default: **/node_modules/**] skip paths, splitted by comma
  --sync                   sync snippets
```

## Commands

#### Sync snippets

[Official Snippets](https://github.com/xinminlabs/synvert-snippets-javascript) are available on github,
you can sync them any time you want.


```
$ synvert-javascript --sync
```

#### List snippets

List all available snippets.

```
$ synvert-javascript -l

$ synvert-javascript --list --format json
```

#### Show a snippet

Describe what a snippet does.

```
$ synvert-javascript -s jquery/migrate
```

#### Run a snippet

Run a snippet, analyze and then rewrite code.

```
$ synvert-javascript --run jquery/migrate
```

Run a snippet from remote url.

```
$ synvert-javascript --run https://raw.githubusercontent.com/xinminlabs/synvert-snippets-javascript/master/lib/javascript/no-useless-constructor.js
```

Run a snippet from local file.

```
$ synvert-javascript --run ~/Sites/xinminlabs/synvert-snippets-javascript/lib/jquery/deprecate-event-shorthand.js
```

Show processing files when running a snippet.

```
$ synvert-javascript --run javascript/no-useless-constructor --showRunProgress
```

Enable EcmaFeatures jsx.

```
$ synvert-javascript --run javascript/no-useless-constructor --enableEcmaFeaturesJsx
```

Skip paths.

```
$ synvert-javascript --run javascript/no-useless-constructor --skipPaths **/node_modules/**,**/dist/**
```

Only paths.

```
$ synvert-javascript --run javascript/no-useless-constructor --onlyPaths frontend/src/javascripts
```

Root path.

```
$ synvert-javascript --run javascript/no-useless-constructor --rootPath /repos/synvert
```

#### Generate a snippet

```
$ synvert-javascript -g javascript/convert-foo-to-bar
```
