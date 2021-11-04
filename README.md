# synvert

write javascript code to change javascript code

[![Version](https://img.shields.io/npm/v/synvert.svg)](https://npmjs.org/package/synvert)
[![AwesomeCode Status for xinminlabs/synvert-javascript](https://awesomecode.io/projects/a211af53-b83c-49e0-b12f-985463cbf297/status)](https://awesomecode.io/repos/xinminlabs/synvert-javascript)

## Usage

Install through npm

```
$ npm install -g synvert
$ synvert-javascript --sync
```

Or use it without installing

```
$ npx synvert-javascript --sync
$ npx synvert-javascript --list
```

## Commands

#### sync snippets

```
$ synvert-javascript --snipets
```

#### list all snippets

```
$ synvert-javascript --list
```

#### show a snippet

```
$ synvert-javascript --show javascript/no-useless-constructor
```

#### run a snippet

```
$ synvert-javascript --run javascript/no-useless-constructor 
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
