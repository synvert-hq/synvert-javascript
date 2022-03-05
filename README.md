# synvert

<img src="https://synvert.xinminlabs.com/img/logo_96.png" alt="logo" width="32" height="32" />

[![Version](https://img.shields.io/npm/v/synvert.svg)](https://npmjs.org/package/synvert)
[![AwesomeCode Status for xinminlabs/synvert-javascript](https://awesomecode.io/projects/a211af53-b83c-49e0-b12f-985463cbf297/status)](https://awesomecode.io/repos/xinminlabs/synvert-javascript)

## Usage

Install through npm

```
$ npm install -g synvert
$ synvert-javascript --sync

$ synvert-javascript --help
Write javascript code to change javascript code

USAGE
  $ synvert-javascript

OPTIONS
  -d, --load=load          load custom snippets, snippet paths can be local file path or remote http url
  -f, --format=format      output format
  -g, --generate=generate  generate a snippet with snippet name
  -h, --help               show CLI help
  -l, --list               list snippets
  -r, --run=run            run a snippet with snippet name
  -s, --show=show          show a snippet with snippet name
  -v, --version
  --enableEcmaFeaturesJsx  enable EcmaFeatures jsx
  --path=path              [default: .] project path
  --showRunProcess         show processing files when running a snippet
  --skipFiles=skipFiles    [default: node_modules/**] skip files, splitted by comma
  --sync                   sync snippets
```

Or use it without installing

```
$ npx -p synvert synvert-javascript --sync
$ npx -p synvert synvert-javascript --list
```

## Commands

#### sync snippets

```
$ synvert-javascript --snipets
```

#### list all snippets

```
$ synvert-javascript --list

$ synvert-javascript --list --format json
```

#### show a snippet

```
$ synvert-javascript --show javascript/no-useless-constructor
```

#### run a snippet

```
$ synvert-javascript --run javascript/no-useless-constructor
```

load custom snippet

```
$ synvert-javascript --load https://raw.githubusercontent.com/xinminlabs/synvert-snippets-javascript/master/lib/javascript/no-useless-constructor.js --run javascript/no-useless-constructor

$ synvert-javascript --load ~/Sites/xinminlabs/synvert-snippets-javascript/lib/jquery/deprecate-event-shorthand.js --run javascript/no-useless-constructor
```

show run progress

```
$ synvert-javascript --run javascript/no-useless-constructor --showRunProgress
```

enable ecma features jsx

```
$ synvert-javascript --run javascript/no-useless-constructor --enableEcmaFeaturesJsx
```

skip files

```
$ synvert-javascript --run javascript/no-useless-constructor --skipFiles=test/**
```

customize path

```
$ synvert-javascript --run javascript/no-useless-constructor --path=/repos/synvert
```
