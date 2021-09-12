# synvert

write javascript code to change javascript code

[![Version](https://img.shields.io/npm/v/synvert.svg)](https://npmjs.org/package/synvert)
[![Downloads/week](https://img.shields.io/npm/dw/synvert.svg)](https://npmjs.org/package/synvert)
[![License](https://img.shields.io/npm/l/synvert.svg)](https://github.com/xinminlabs/synvert-javascript/blob/master/package.json)

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
