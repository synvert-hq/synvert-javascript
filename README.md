# synvert

write javascript code to change javascript code

[![Version](https://img.shields.io/npm/v/synvert.svg)](https://npmjs.org/package/synvert)
[![AwesomeCode Status for xinminlabs/synvert-javascript](https://awesomecode.io/projects/a211af53-b83c-49e0-b12f-985463cbf297/status)](https://awesomecode.io/repos/xinminlabs/synvert-javascript)

## Usage

```
$ npm install -g synvert
$ synvert --synvert
```

## Commands

#### sync snippets

```
$ synvert --snipets
```

#### list all snippets

```
$ synvert --list
```

#### show a snippet

```
$ synvert --show javascript/no-useless-constructor
```

#### run a snippet

```
$ synvert --run javascript/no-useless-constructor 
```

show run progress

```
$ synvert --run javascript/no-useless-constructor --showRunProgress
```

enable ecma features jsx

```
$ synvert --run javascript/no-useless-constructor --enableEcmaFeaturesJsx
```

skip files

```
$ synvert --run javascript/no-useless-constructor --skipFiles=test/**
```

customize path

```
$ synvert --run javascript/no-useless-constructor --path=/repos/synvert
```
